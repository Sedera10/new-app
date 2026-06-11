import { parseFile2CSV, TYPE_MAP, STATUS_MAP_GLPI, PRIORITY_MAP, resolveItem, ItemsToTableau } from './helper';
import { normalizeDate, normalizeNumber } from '../Global';
import { rollbackImportedResources } from "../rollback";
import { createItem, updateItem } from '../../api';

export const importFile2 = async (csvFile, result1, onProgress = () => {}) => {
  const results = {
    done: [],
    errors: [],
    touchedResources: result1.touchedResources,
    ticketMap: {}
  };

  const AddResourceTouched = (resource) => {
    if (resource) results.touchedResources.add(resource);
  };

  try {
    onProgress({ step: 'parsing', message: 'parsing', description: 'Parsing du CSV...', percentage: 0 });
    const csvData = await parseFile2CSV(csvFile);

    if (!csvData || csvData.length === 0) {
      console.log('Fichier CSV vide');
      return results;
    }

    const totalUnits = csvData.length;
    let completedUnits = 0;
    let totalTickets = 0;
    let totalItemTickets = 0;

    const updateProgress = ({ step, description }) => {
      const percentage = Math.round((completedUnits / totalUnits) * 100);
      onProgress({ step, message: step, description, percentage });
    };

    for (let i = 0; i < csvData.length; i++) {
      const ligne = csvData[i];

      try {
        const ref = ligne.refticket?.toString().trim();
        const daty = ligne.date?.toString().trim();
        const lera = ligne.heure?.toString().trim();
        const typeId = TYPE_MAP[ligne.type?.trim()];
        const titre = ligne.titre?.toString().trim();
        const desc = ligne.description?.toString().trim();
        const statusId = STATUS_MAP_GLPI[ligne.status?.trim()] ?? 1;
        const prioriteId = PRIORITY_MAP[ligne.priority?.trim()] ?? 3;
        const items = ItemsToTableau(ligne.items);

        const payload = {
          name: titre,
          content: desc,
          date: normalizeDate(daty, lera),
          type: typeId,
          status: 1,
          priority: prioriteId,
          entities_id: 0,
        };

        const ticket = await createItem("Ticket", payload);

        if (ticket) {
          AddResourceTouched("Ticket");
          totalTickets += 1;

          const idTicket = ticket.id;
          results.ticketMap[ref] = normalizeNumber(idTicket);
          console.log("Ticket cree, id:", idTicket);

          for (const itemName of items) {
            const resolved = await resolveItem(itemName);

            if (!resolved) {
              results.errors.push(`Element introuvable : ${itemName}`);
              continue;
            }

            try {
              const itemTicket = await createItem("Item_Ticket", {
                tickets_id: idTicket,
                itemtype: resolved.itemtype,
                items_id: resolved.id,
              });

              AddResourceTouched("Item_Ticket");
              totalItemTickets += 1;
              console.log(`Item_Ticket id:${itemTicket?.id} -> ticket ${idTicket}`);
            } catch (error) {
              console.log(`Erreur liaison Item_Ticket '${itemName}' -> ticket #${idTicket}:`, error.message);
              results.errors.push(`Ticket ligne ${i + 1}, element '${itemName}': ${error.message}`);
            }
          }

          if (statusId !== 1) {
            await updateItem("Ticket", idTicket, {
              status: statusId,
              date_mod: normalizeDate(daty, lera),
              _users_id_assign: 4
            });
            console.log(`Mis a jour de status de ticket #${idTicket} vers ${statusId}`);
          }
        }
      } catch (error) {
        console.log("Erreur creation ticket :", error.message);
        results.errors.push(`Ticket ligne ${i + 1}: ${error.message}`);
      }

      completedUnits += 1;
      updateProgress({
        step: 'tickets',
        description: `Ticket ${completedUnits} / ${totalUnits}...`,
      });
    }

    results.done.push(`Tickets crees : ${totalTickets}`);
    results.done.push(`Liaisons Item_Ticket creees : ${totalItemTickets}`);
    return results;
  } catch (error) {
    await rollbackImportedResources({
      touchedResources: results.touchedResources,
      onProgress,
      label: 'Erreur file2'
    });
    results.errors.push(`Erreur generale: ${error.message}`);
    throw error;
  }
};
