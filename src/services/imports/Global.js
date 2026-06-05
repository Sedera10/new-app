import Papa from 'papaparse';

// CONTROLE
export const createValidationError = (message) => {
  const error = new Error(message);
  error.isValidationError = true;
  return error;
};

const normalizeCsvHeader = (value) => (value ?? '')
  .toString()
  .replace(/^\uFEFF/, '')
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[\s_]+/g, '');


const normalizeCsvValue = (value) => (value ?? '').toString().trim();

const normalizeCsvRows = (rows) => rows.map((row) => {
  const normalizedRow = {};

  Object.entries(row || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeCsvHeader(key);
    normalizedRow[normalizedKey] = (value ?? '').toString().trim();
  });

  return normalizedRow;
});

// PARSE CSS
export const validationHeader = (fields, schema) => {
  const expectedFields = schema.fields;

  const unexpectedFields = fields.filter(
    (field) => !expectedFields.includes(field.trim())
    // si non sensible a la casse :
    // (field) => !expectedFields.some(
    //   (expected) => expected.toLowerCase() === field.toLowerCase()
    // )
  );

  const missingFields = expectedFields.filter(
    (field) => !fields.includes(field.trim())
    // si non sensible a la casse :
    // (field) => !fields.some(
    //   (csvField) => csvField.toLowerCase() === field.toLowerCase()
    // )
  );

  return {
    isValid:
      unexpectedFields.length === 0 &&
      missingFields.length === 0,
    unexpectedFields,
    missingFields
  };
};

export const parseCSVWithPapa = (file, schema) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      delimiter: ',',
      complete: (results) => {
        try {
          const fields = results.meta?.fields || [];
          // ici les controlles ou verifications
          //validationHeader(fields, schema);
          const normalizedRows = normalizeCsvRows(results.data || []);
          resolve(normalizedRows);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
};

// NOMBRE
export const roundDecimal = (value, decimals = 6) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = value
    .toString()
    .replace(/\s/g, "")   // supprime espaces
    .replace(",", ".");   // virgule → point

  const number = Number(cleaned);

  return isNaN(number) ? null : number;
};

export const isPositive = (value) => Number.isFinite(normalizeNumber(value)) && normalizeNumber(value) > 0;


// DATE
export const isValidDateDMY = (value) => {
  const dateValue = normalizeCsvValue(value);
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
    return false;
  }

  const [dayText, monthText, yearText] = dateValue.split('/');
  const day = Number.parseInt(dayText, 10);
  const month = Number.parseInt(monthText, 10);
  const year = Number.parseInt(yearText, 10);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }

  const parsedDate = new Date(year, month - 1, day);
  return parsedDate.getFullYear() === year
    && parsedDate.getMonth() === month - 1
    && parsedDate.getDate() === day;
};

export const normalizeDate = (value, time = null) => {
    if (!value) return null;
    // Format : DD/MM/YYYY
    if (typeof value === "string" && isValidDateDMY(value)) {
      const [day, month, year] = value.split("/");
      value = `${year}-${month}-${day}`;
    }

    // Format : YYYY/MM/DD, YYYY-MM-DD, YYYY-MM-DD HH:mm:SS, YYYY-MM-DD HH:mm
    const date = new Date(
      typeof value === "string"
        ? value.replace(/\//g, "-")
        : value
    );

    if (isNaN(date.getTime())) return null;

    const pad = (n) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    // Si heure fournie en 2e paramètre
    if (time) {
      const timeParts = time.split(":");

      hours = timeParts[0] ? Number(timeParts[0]) : 0;
      minutes = timeParts[1] ? Number(timeParts[1]) : 0;
      seconds = timeParts[2] ? Number(timeParts[2]) : 0;
    } else {
      hours = date.getHours();
      minutes = date.getMinutes();
      seconds = date.getSeconds();
    }

    return `${year}-${month}-${day} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

