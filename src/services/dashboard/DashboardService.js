import { api, getItemCount, getItemCountFiltered } from "../api";
import { TYPE_MAP } from "../imports/file2/helper";

// fonctions utiles
export const getElementItems = () => {
    const resourcesLigne = import.meta.env.VITE_ELEMENTS_ITEMS || "";
    const resourcesToWipe = resourcesLigne.split(',').filter(res => res !== "");
    return resourcesToWipe;
};
export const getTicketTypes = () => {
  const resourcesLigne = import.meta.env.VITE_TICKETS_TYPES || "";
  const types = resourcesLigne.split(',').filter(res => res !== "");
  return types
};
export const getTicketTypeMap = () => {
  const resourcesLigne = import.meta.env.VITE_TICKETS_TYPES || "";
  const types = resourcesLigne.split(',').filter(res => res !== "");
  return types.reduce((acc, type, index) => {
    acc[type.trim()] = index + 1;
    return acc;
  }, {});
};

// ==  TOTAL ELEMENT (DETAILS) ===
export const DetailsElements = async () => {
  const resources  = getElementItems();
  const rows = await Promise.all(
    resources.map(async (resource) => {
      const count = await getItemCount(resource);
      return { item: resource, count };
    })
  );

  return rows;
};

// === TOTAL TICKET (DETAILS) ===
export const DetailsTickets = async () => {
  const typeMap = getTicketTypeMap();

  const rows = await Promise.all(
    Object.entries(typeMap).map(async ([label, typeId]) => {
      const count = await getItemCountFiltered("Ticket", [
        { field: 14, searchtype: "equals", value: typeId }
      ]);
      return { type: label, count };
    })
  );

  return rows;
};
