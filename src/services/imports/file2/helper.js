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
  "Request": 2,
  "Demande":  2,
};

export const STATUS_MAP_GLPI = {
  "New":      1,
  "assigned": 2,
  "In progress":  2,
  "In Progress (assigned)":2,
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
  "Major":     4,
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

const normalizeSearchName = (value) => String(value ?? "")
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

export async function resolveItem(name) {
  const searchedName = normalizeSearchName(name);

  if (!searchedName) {
    return null;
  }

  for (const resource of TICKET_ITEM_RESOURCES) {
    try {
      const items = await getItems(resource, {
        searchText: name,
        range: "0-100",
      });

      if (Array.isArray(items)) {
        const match = items.find(item => normalizeSearchName(item.name) === searchedName);
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
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(
      parsed
        .map(item => item?.toString().trim())
        .filter(Boolean)
    )];
  } catch (error) {
    console.warn(`Items invalides : ${value}`);
    return [];
  }
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
