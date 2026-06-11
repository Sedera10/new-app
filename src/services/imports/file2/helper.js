import { parseCSVWithPapa } from '../Global';
import { searchItems, getItems } from '../../api';

export const normalizeName = (value) => (value ?? '')
  .toString()
  .replace(/^\uFEFF/, '')
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9\s]/g, '');

export const TYPE_MAP = {
  "Incident": 1,
  "Demande":  2,
};

export const STATUS_MAP_GLPI = {
  "New":      1,
  "assigned": 2,
  "In progress":  2,
  "Closed":   6,
};

export const STATUS_MAP = {
  "Nouveau":      1,
  "In progress":  2,
  "Terminé":   6,
};

export const PRIORITY_MAP = {
  "Very Low":  1,
  "Low":       2,
  "Medium":    3,
  "High":      4,
  "Very High": 5,
};

const TICKET_ITEM_RESOURCES = [
  "Computer",
  "Monitor", 
  "Printer",
  "Peripheral",
  "NetworkEquipment",
  "Phone",
  "Rack",
  "Enclosure",
  "Software",
  "Certificate",
  "Database",
  "Line",
  "PassiveDCEquipment",
  "Unmanaged",
];

export async function resolveItem(name) {
  for (const resource of TICKET_ITEM_RESOURCES) {
    try {
      const items = await getItems(resource, {
        searchText: name,
        range: "0-10",
      });

      if (Array.isArray(items)) {
        const match = items.find(item => item.name === name);
        if (match) {
          return { itemtype: resource, id: match.id };
        }
      }
    } catch (error) {
      console.warn(`Recherche ignorée pour ${resource}: ${error.message}`);
    }
  }

  console.warn(`Élément introuvable : "${name}"`);
  return null;
}

export const ItemsToTableau = (value) => {
  return JSON.parse(value);
}

const FILE2_SCHEMA = {
  fields: [
    'Ref_Ticket',
    'Date',
    'Heure',
    'Type',
    'Titre',
    'Description',
    'Status',
    'Priority',
    'Items'
  ]
};

export const parseFile2CSV = (file) => parseCSVWithPapa(file, FILE2_SCHEMA);
