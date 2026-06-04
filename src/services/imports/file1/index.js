import { parseFile1CSV } from './helper';
import {
  createValidationError, isPositive, isValidDateDMY, normalizeNumber, normalizeDate
} from '../Global';
import { resetAllData } from "../../resetdata/resetService";

export const importFile1 = async (csvFile, onProgress = () => {}) => {
  const results = {
    resourceDone: [],
    errors: []
  };
  const touchedResources = new Set();

  const AddResourceTouched = (resource) => {
    if (resource) {
      touchedResources.add(resource);
    }
  };

  try {
    onProgress?.({ step: 'parsing', message: 'parsing', description: 'Parsing du CSV...', percentage: 0 });
    const csvData = await parseFile1CSV(csvFile);

    if (!csvData || csvData.length === 0) {
      console.log('Fichier 1 CSV vide');
      return results;
    }

    // EXTRACTION

    // CREATION
    // Appeler AddResourceTouched('resourceName') apres le 1er ajout reussi.

    return results;
    
  } catch (error) {
    if (touchedResources.size > 0) {
      await resetAllData(Array.from(touchedResources));
    }
    results.errors.push(`Erreur generale: ${error.message}`);
    throw error;
  }
};