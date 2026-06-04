import { parseCSVWithPapa } from '../Global';

// exemple
export const extractCategories = (csvData) => {
  const categories = {};
  csvData.forEach((row) => {
    const catName = row.categorie?.trim();
    if (catName && !categories[catName]) {
      categories[catName] = true;
    }
  });
  return Object.keys(categories);
};

const FILE1_SCHEMA = {
  fields: [
    'date_availability_produit',
    'nom',
    'reference',
    'prix_ttc',
    'taxe',
    'categorie',
    'prix_achat'
  ]
};

export const parseFile1CSV = (file) => parseCSVWithPapa(file, FILE1_SCHEMA);
