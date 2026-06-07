import { parseCSVWithPapa } from '../Global';

// exemple
export const extractStatus = (csvData) => {
  const states = {};
  csvData.forEach((row) => {
    const statName = row.status?.trim();
    if (statName && !states[statName]) {
      states[statName] = true;
    }
  });
  return Object.keys(states);
};
export const extractLocations = (csvData) => {
  const locations = {};
  csvData.forEach((row) => {
    const loc = row.location?.trim();
    if (loc && !locations[loc]) {
      locations[loc] = true;
    }
  });
  return Object.keys(locations);
};
export const extractManufacturers = (csvData) => {
  const manufacturers = {};
  csvData.forEach((row) => {
    const manu = row.manufacturer?.trim();
    if (manu && !manufacturers[manu]) {
      manufacturers[manu] = true;
    }
  });
  return Object.keys(manufacturers);
};
export const extractModels = (csvData) => {
  const models = {};
  csvData.forEach((row) => {
    const model = row.model?.trim();
    const itemtype = row.item_type?.trim();
    if (model && itemtype) {
      const key = `${itemtype}|${model}`;
      if (!models[key]) {
        models[key] = { itemtype, model };
      }
    }
  });
  return Object.values(models);
};

// Fonction pour obtenir le nom de la table de modèle selon le type
export const getModelTableName = (itemtype) => {
  const modelTables = {
    'Computer': 'ComputerModel',
    'Monitor': 'MonitorModel',
    'Printer': 'PrinterModel',
    'NetworkEquipment': 'NetworkEquipmentModel',
    'Peripheral': 'PeripheralModel',
  };
  return modelTables[itemtype] || 'ComputerModel';
};

export const normalizeName = (value) => (value ?? '')
  .toString()
  .replace(/^\uFEFF/, '')
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9\s]/g, '');

export const extractUsers = (csvData) => {
  const users = {};
  csvData.forEach((row) => {
    const user = normalizeName(row.user);
    if (user && !users[user]) {
      users[user] = true;
    }
  });
  return Object.keys(users);
};

const FILE1_SCHEMA = {
  fields: [
    'Name',
    'Status',
    'Location',
    'Manufacturer',
    'Item_Type',
    'Model',
    'Inventory_Number',
    'User'
  ]
};

export const parseFile1CSV = (file) => parseCSVWithPapa(file, FILE1_SCHEMA);
