import { parseFile2CSV, TYPE_MAP, STATUS_MAP_GLPI, PRIORITY_MAP, resolveItem, ItemsToTableau } from './helper';
import { normalizeDate, normalizeNumber } from '../Global';
import { resetAllData } from "../../resetdata/resetService";
import { createItem, updateItem } from '../../api';

export const importFile2 = async (csvFile, result1, onProgress = () => {}) => {
  const results = {
    done : [],
    errors : [],
    touchedResources : result1.touchedResources,
    ticketMap : {}
  };

  const AddResourceTouched = (resource) => {
    if (resource) results.touchedResources.add(resource);
  };

  try {
    // == PARSING ==
    onProgress({ step: 'parsing', message: 'parsing', description: 'Parsing du CSV...', percentage: 0 });
    const csvData = await parseFile2CSV(csvFile);

    if (!csvData || csvData.length === 0) {
      console.log('Fichier CSV vide');
      return results;
    }

    const totalUnits = csvData.length;
    let completedUnits = 0;

    const updateProgress = ({ step, description }) => {
      const percentage = Math.round((completedUnits / totalUnits) * 100);
      onProgress({ step, message: step, description, percentage });
    };

    // == CREATION TICKETS ==
    let totalTickets = 0;

    for (let i = 0; i < csvData.length; i++) {
      const ligne = csvData[i];

      try {
        const ref      = ligne.refticket.toString().trim(); 
        const daty     = ligne.date?.toString().trim();
        const lera     = ligne.heure?.toString().trim();
        const typeId   = TYPE_MAP[ligne.type?.trim()];
        const titre    = ligne.titre?.toString().trim();
        const desc     = ligne.description?.toString().trim();
        const statusId = STATUS_MAP_GLPI[ligne.status?.trim()];
        const prioriteId = PRIORITY_MAP[ligne.priority?.trim()];
        const items    = ItemsToTableau(ligne.items?.trim());

        const payload = {
          name:        titre,
          content:     desc,
          date:        normalizeDate(daty, lera),
          type:        typeId,
          status:      1,
          priority:    prioriteId,
          entities_id: 0,
        };

        const ticket = await createItem("Ticket", payload);

        if (ticket) {
          AddResourceTouched("Ticket");
          totalTickets += 1;
          const idTicket = ticket.id; // ✅ corrigé
          results.ticketMap[ref] = normalizeNumber(idTicket) 
          console.log("Ticket créé, id:", idTicket);

          // == LIAISON TICKET ↔ ELEMENTS ==
          for (const itemName of items) {
            const resolved = await resolveItem(itemName);
            if (resolved) {
              const itemTicket = await createItem("Item_Ticket", {
                tickets_id: idTicket,
                itemtype:   resolved.itemtype,
                items_id:   resolved.id,
              });
              AddResourceTouched("Item_Ticket");
              console.log(`Item_Ticket id:${itemTicket?.id} → ticket ${idTicket}`);
            } else {
              results.errors.push(`Élément introuvable : ${itemName}`);
            }
          }
          if (statusId !== 1) {
            await updateItem("Ticket", idTicket, {
              status: statusId,
              date_mod: normalizeDate(daty, lera), 
              _users_id_assign: 4
            });
            console.log(`Mis a jour de status de ticket #${idTicket} vers ${statusId}`)
          }
        }

      } catch (error) {
        console.log("Erreur création ticket :", error.message);
        results.errors.push(`Ticket ligne ${i + 1}: ${error.message}`);
      }

      // Progression après chaque ticket traité
      completedUnits += 1;
      updateProgress({
        step: 'tickets',
        description: `Ticket ${completedUnits} / ${totalUnits}...`,
      });
    }

    results.done.push(`Tickets créés : ${totalTickets}`);
    return results;

  } catch (error) {
    if (touchedResources.size > 0) {
      await resetAllData(Array.from(touchedResources));
    }
    results.errors.push(`Erreur générale: ${error.message}`);
    throw error;
  }
};