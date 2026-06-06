import { parseCSVWithPapa } from '../Global';
import { searchItems, getItems } from '../../api';

export const normalizeName = (value) => (value ?? '')
  .toString()
  .replace(/^\uFEFF/, '')
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9\s]/g, '');


const FILE3_SCHEMA = {
  fields: [
    'Num_Ticket',
    'Duration_second',
    'Time_Cost',
    'Fixed_Cost'
  ]
};

export const parseFile3CSV = (file) => parseCSVWithPapa(file, FILE3_SCHEMA);
