import { parseFile1CSV, extractStatus, extractLocations, extractManufacturers, extractModels, extractUsers, normalizeName, getModelTableName, getModelFieldName } from './helper';
import { normalizeNumber, normalizeCsvValue } from '../Global';
import { rollbackImportedResources } from "../rollback";
import { createItem, searchItems } from '../../api'

export const importFile1 = async (csvFile, onProgress = () => {}) => {
  const results = {
    done: [],
    errors: [],
    touchedResources: new Set()
  };

  const AddResourceTouched = (resource) => {
    if (resource) {
      results.touchedResources.add(resource);
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
    const status = extractStatus(csvData);
    const locations = extractLocations(csvData);
    const manufacturers = extractManufacturers(csvData);
    const models = extractModels(csvData);
    const users = extractUsers(csvData);
    console.log("Users : ",users)

    const totalUnits = 1 + status.length + locations.length + manufacturers.length + models.length + users.length + csvData.length;
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
        results.errors.push(`Status '${stateName}': ${error.message}`);
      }
      completedUnits += 1;
      updateProgress({ step: 'status', message: 'status', description: 'creation des "statut"...' });
    }
    results.done.push(`Status créés : ${Object.keys(statusMap).length}`)

    // == CREATION LOCATION ==
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
    results.done.push(`Location créés : ${Object.keys(locationMap).length}`)

    // == CREATION MANUFACTURER ==
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
    const modelMap = {}
    for (const modelInfo of models) {
      try {
        const payload = { 
          name: modelInfo.model
        }
        const modelTable = getModelTableName(modelInfo.itemtype);
        const createdModel = await createItem(modelTable, payload)
        const idModel = createdModel?.id;

        AddResourceTouched(modelTable);
        modelMap[`${modelInfo.itemtype}|${modelInfo.model}`] = idModel
        console.log(`[importFile1] Model '${modelInfo.model}' (${modelInfo.itemtype}) créé dans ${modelTable}, id: ${idModel}`);
      } catch (error) {
        console.log("Erreur de creation 'model' : " , error.message)
        results.errors.push(`Model '${modelInfo.model}' (${modelInfo.itemtype}): ${error.message}`);
      }
      completedUnits += 1
      updateProgress({ step: 'model', message: 'model', description: 'creation des "model"...'});
    }
    results.done.push(`Model créés : ${Object.keys(modelMap).length}`)

    // == CREATION USER ==
    const userMap = {};
    for (const user of users) {
      try {
        // Chercher si le user existe déjà par son nom
        const existing = await searchItems("User", [
          { field: 1, searchtype: "equals", value: user }
        ]);

        let idUser;

        if (existing?.data?.length > 0) {
          idUser = existing.data[0].id;
          console.log(`User '${user}' déjà existant, id: ${idUser}`);
        } else {
          const userCreated = await createItem("User", { name: user });
          idUser = userCreated?.id;
          AddResourceTouched('User');
          console.log(`User '${user}' créé, id: ${idUser}`);
        }

        userMap[user] = idUser;

      } catch (error) {
        console.log("Erreur user :", error.message);
        results.errors.push(`User '${user}': ${error.message}`);
      }

      completedUnits += 1;
      updateProgress({ step: 'user', message: 'user', description: 'Création des users...' });
    }
    results.done.push(`User créés : ${Object.keys(userMap).length}`)

    // == CREATION ELEMENTS ==
    let totalElements = 0
    for(let i=0 ; i < csvData.length ; i++ ){
      const elementData = csvData[i];

      try {
        const name = elementData.name?.trim();
        const statusId = statusMap[elementData.status?.trim()];
        const locationId = locationMap[elementData.location?.trim()];
        const manufacturerId = manufacturerMap[elementData.manufacturer?.trim()];
        const resource = normalizeCsvValue(elementData.itemtype)
        const modelId = modelMap[`${resource}|${elementData.model?.trim()}`];
        const serial = elementData.inventorynumber?.trim();
        const userString = normalizeName(elementData.user?.trim());
        const userId = userMap[userString] ? userMap[userString] : 0

        const payload = {
          name : name,
          entities_id : 0
        };

        if (serial) {
          payload.serial = serial;
          payload.otherserial = serial;
        }

        if (statusId) {
          payload.states_id = normalizeNumber(statusId);
        }

        if (locationId) {
          payload.locations_id = normalizeNumber(locationId);
        }

        if (manufacturerId) {
          payload.manufacturers_id = normalizeNumber(manufacturerId);
        }

        if (userId) {
          payload.users_id = normalizeNumber(userId);
        }
        
        // Ajouter le modèle avec la bonne propriété selon le type
        if (modelId) {
          payload[getModelFieldName(resource)] = normalizeNumber(modelId);
        }

        const elementCreated = await createItem(resource, payload);
        if (elementCreated) {
          AddResourceTouched(resource);
          totalElements += 1;
        }

      } catch (error) {
          console.log("Erreur de creation 'Element' : " , error.message)
          results.errors.push(`Erreur de creation 'Element': ${error.message}`);
      }
      completedUnits += 1;
      updateProgress({ step: 'elements', message: 'elements', description: 'creation des "elements"...' });
    }
    results.done.push(`Elements créés : ${totalElements}`)

    return results;
    
  } catch (error) {
    await rollbackImportedResources({
      touchedResources: results.touchedResources,
      onProgress,
      label: 'Erreur file1'
    });
    results.errors.push(`Erreur generale: ${error.message}`);
    throw error;
  }
};
