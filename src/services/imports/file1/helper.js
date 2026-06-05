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
    if (model && !models[model]) {
      models[model] = true;
    }
  });
  return Object.keys(models);
};

export const extractUsers = (csvData) => {
  const users = {};
  csvData.forEach((row) => {
    const user = row.user?.trim();
    if (user && !users[user]) {
      users[user] = true;
    }
  });
  return Object.keys(users);
};

export const normalizeName = (value) => (value ?? '')
  .toString()
  .replace(/^\uFEFF/, '')
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[\s_]+/g, '.');

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
