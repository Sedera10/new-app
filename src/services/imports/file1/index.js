import { parseFile1CSV, extractStatus, extractLocations, extractManufacturers, extractModels,extractUsers, normalizeName } from './helper';
import {
  createValidationError, isPositive, isValidDateDMY, normalizeNumber, normalizeDate, normalizeCsvValue
} from '../Global';
import { resetAllData } from "../../resetdata/resetService";
import { createItem } from '../../api'

export const importFile1 = async (csvFile, onProgress = () => {}) => {
  const results = {
    done: []
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
    onProgress?.({ step: 'extracting', message: 'extracting', description: 'Extraction des colonnes...', percentage: 2 });
    console.log("== Extraction des colonnes ==")
    const status = extractStatus(csvData);
    const locations = extractLocations(csvData);
    const manufacturers = extractManufacturers(csvData);
    const models = extractModels(csvData);
    const users = extractUsers(csvData);

    const totalUnits = 1 + status.length + locations.length + manufacturers.length + models.length + csvData.length;
    let completedUnits = 1;

    const updateProgress = ({ step, message, description }) => {
      const percentage = Math.round((completedUnits / totalUnits) * 100);
      onProgress?.({ step, message, description, percentage });
    };

    // == CREATION STATUS ==
    onProgress?.({ step: 'status', message: 'status', description: 'creation des "statut"...' });
    const statusMap = {}
    for (const stateName of status) {
      try {
        const payload = { 
          name: stateName,
          entities_id : 0,
          is_recursive: 1
        }
        const state = await createItem("State", payload)
        const idState = state?.id;

        AddResourceTouched('State');
        statusMap[stateName] = idState
      } catch (error) {
        console.log("Erreur de creation status : " , error.message)
        results.errors.push(`Status '${categoryName}': ${error.message}`);
      }
      completedUnits += 1;
      updateProgress({ step: 'status', message: 'status', description: 'creation des "statut"...' });
    }
    results.done.push(`Nombre Status créés : ${Object.keys(statusMap).length}`)

    // == CREATION LOCATION ==
    onProgress?.({ step: 'location', message: 'location', description: 'creation des "location"...' });
    const locationMap = {}
    for (const locName of locations) {
      try {
        const payload = { 
          name: locName,
          entities_id : 0
        }
        const location = await createItem("Location", payload)
        const idLocation = location?.id;

        AddResourceTouched('Location');
        locationMap[locName] = idLocation
      } catch (error) {
        console.log("Erreur de creation 'location' : " , error.message)
        results.errors.push(`Location '${locName}': ${error.message}`);
      }
      completedUnits += 1;
      updateProgress({ step: 'location', message: 'location', description: 'creation des "location"...' });
    }
    results.done.push(`Nombre Location créés : ${Object.keys(locationMap).length}`)

    // == CREATION MANUFACTURER ==
    onProgress?.({ step: 'manufacturer', message: 'manufacturer', description: 'creation des "manufacturer"...'});
    const manufacturerMap = {}
    for (const manu of manufacturers) {
      try {
        const payload = { 
          name: manu
        }
        const manufact = await createItem("Manufacturer", payload)
        const idManufact = manufact?.id;

        AddResourceTouched('Manufacturer');
        manufacturerMap[manu] = idManufact
      } catch (error) {
        console.log("Erreur de creation 'Manufacturer' : " , error.message)
        results.errors.push(`Manufacturer '${manu}': ${error.message}`);
      }
      completedUnits += 1;
      updateProgress({ step: 'manufacturer', message: 'manufacturer', description: 'creation des "manufacturer"...'});
    }
    results.done.push(`Nombre Manufacturer créés : ${Object.keys(manufacturerMap).length}`)

    // == CREATION MODEL ==
    onProgress?.({ step: 'model', message: 'model', description: 'creation des "model"...'});
    const modelMap = {}
    for (const model of models) {
      try {
        const payload = { 
          name: model
        }
        const computerModel = await createItem("ComputerModel", payload)
        const idComputerModel = computerModel?.id;

        AddResourceTouched('ComputerModel');
        modelMap[model] = idComputerModel
      } catch (error) {
        console.log("Erreur de creation 'model' : " , error.message)
        results.errors.push(`Model '${model}': ${error.message}`);
      }
      completedUnits += 1
      updateProgress({ step: 'model', message: 'model', description: 'creation des "model"...'});
    }
    results.done.push(`Nombre Model créés : ${Object.keys(modelMap).length}`)

    // == CREATION USER ==
    onProgress?.({ step: 'user', message: 'user', description: 'creation des "user"...'});
    const userMap = {}
    for (const user of users) {
      const normaleName = normalizeName(user)
      try {
        const payload = {
            name : normaleName,
            firstname : userString.split(" ")[1],
            realname : userString.split(" ")[0],
            entities_id : 0, 
            is_active: 1
          }
        const userCreated = await createItem("User", payload)
        const idUserCreated = userCreated?.id;

        AddResourceTouched('User');
        userMap[normaleName] = idUserCreated
      } catch (error) {
        console.log("Erreur de creation 'user' : " , error.message)
        results.errors.push(`User '${model}': ${error.message}`);
      }
      completedUnits += 1
      updateProgress({ step: 'user', message: 'user', description: 'creation des "user"...'});
    }
    results.done.push(`Nombre User créés : ${Object.keys(userMap).length}`)

    // == CREATION ELEMENTS ==
    let totalElements = 0
    for(int i=0 ; i < csvData.length ; i++ ){
      const elementData = csvData[i];

      try {
        const name = elementData.name?.trim();
        const statusId = statusMap[elementData.status?.trim()];
        const locationId = locationMap[elementData.location?.trim()];
        const manufacturerId = manufacturerMap[elementData.manufacturer?.trim()];
        const modelId = modelMap[elementData.model?.trim()];
        const serial = elementData.inventorynumber?.trim();
        const resource = normalizeCsvValue(elementData.itemtype)
        const userString = normalizeName(elementData.user?.trim());
        const userId = userMap[userString] ?? userMap[userString] : null

        const payload = {
          name : name,
          serial : serial,
          otherserial : serial,
          entities_id : 0,
          location_id : normalizeNumber(locationId),
          manufacturer_id : normalizeNumber(manufacturerId),
          computermodels : normalizeNumber(modelId),
          user_id : userId
        }

        const elemenCreated = await createItem(resource, payload);
        if(elemenCreated){
          AddResourceTouched(resource);
          totalElements =+ 1;
        }

      } catch (error) {
          console.log("Erreur de creation 'Element' : " , error.message)
          results.errors.push(`Erreur de creation 'Element': ${error.message}`);
      }
    }
    results.done.push(`Elements créés : ${totalElements}`)

    return results;
    
  } catch (error) {
    if (touchedResources.size > 0) {
      await resetAllData(Array.from(touchedResources));
    }
    results.errors.push(`Erreur generale: ${error.message}`);
    throw error;
  }
};