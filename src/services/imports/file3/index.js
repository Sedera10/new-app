import { parseFile3CSV } from './helper';
import { normalizeNumber } from '../Global';
import { rollbackImportedResources } from "../rollback";
import { createItem } from '../../api';

const numberOrZero = (value) => normalizeNumber(value) ?? 0;
const secondsOrZero = (value) => Math.round(numberOrZero(value));

export const importFile3 = async (csvFile, result2, onProgress = () => {}) => {
  const results = {
    done: [],
    errors: [],
    touchedResources: result2.touchedResources 
  };

  const AddResourceTouched = (resource) => {
    if (resource) results.touchedResources.add(resource);
  };

  try {
    // == PARSING ==
    onProgress({ step: 'parsing', message: 'parsing', description: 'Parsing du CSV...', percentage: 0 });
    const csvData = await parseFile3CSV(csvFile);

    if (!csvData || csvData.length === 0) {
      console.log('Fichier TicketCost vide');
      return results;
    }

    const totalUnits = csvData.length;
    let completedUnits = 0;

    const updateProgress = ({ step, description }) => {
      // Quand completedUnits = totalUnits → 100%
      const percentage = Math.round((completedUnits / totalUnits) * 100);
      onProgress({ step, message: step, description, percentage });
    };

    // == CREATION TICKETCOST ==
    let totalTicketCost = 0;

    for (let i = 0; i < csvData.length; i++) {
      const ligne = csvData[i];

      try {
        const ref = ligne.numticket?.toString().trim();
        const ds  = ligne.durationsecond?.toString().trim();
        const tc  = ligne.timecost?.toString().trim();
        const fc  = ligne.fixedcost?.toString().trim();

        const idTicket = result2.ticketMap?.[ref]; 
        if (!idTicket) {
          results.errors.push(`TicketCost ligne ${i + 1}: Num_Ticket "${ref}" introuvable dans ticketMap`);
          completedUnits += 1;
          updateProgress({ step: 'costs', description: `Cost ${completedUnits} / ${totalUnits}...` });
          continue;
        }

        const payload = {
          tickets_id:    idTicket,
          name:          `Coût ticket #${ref}`,
          actiontime:    secondsOrZero(ds),
          cost_time:     numberOrZero(tc),
          cost_fixed:    numberOrZero(fc),
          cost_material: 0,
          entities_id:   0,
        };

        const ticketCost = await createItem("TicketCost", payload);

        if (ticketCost) {
          AddResourceTouched("TicketCost");
          totalTicketCost += 1;
          console.log("TicketCost créé, id:", ticketCost.id);
        }

      } catch (error) {
        console.log("Erreur création TicketCost :", error.message);
        results.errors.push(`TicketCost ligne ${i + 1}: ${error.message}`);
      }

      completedUnits += 1;
      updateProgress({
        step: 'costs',
        description: `Cost ${completedUnits} / ${totalUnits}...`,
      });
    }

    results.done.push(`TicketCosts créés : ${totalTicketCost}`); // ✅ bonne variable
    return results;

  } catch (error) {
    await rollbackImportedResources({
      touchedResources: results.touchedResources,
      onProgress,
      label: 'Erreur file3'
    });
    results.errors.push(`Erreur générale: ${error.message}`);
    throw error;
  }
};
