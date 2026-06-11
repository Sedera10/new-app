import { resetAllData } from "../resetdata/resetService";

const METADATA_RESOURCES = new Set([
  "State",
  "Location",
  "Manufacturer",
  "User"
]);

const getDeletePriority = (resource) => {
  if (resource === "Item_Ticket" || resource === "TicketCost") {
    return 0;
  }

  if (resource === "Ticket") {
    return 10;
  }

  if (resource?.endsWith("Model")) {
    return 10;
  }

  if (METADATA_RESOURCES.has(resource)) {
    return 20;
  }

  return 0;
};

export const sortResourcesForRollback = (resources = []) => {
  return Array.from(new Set(Array.from(resources || []).filter(Boolean)))
    .sort((a, b) => getDeletePriority(a) - getDeletePriority(b) || a.localeCompare(b));
};

export const rollbackImportedResources = async ({ touchedResources, onProgress = () => {}, label = "Importation" }) => {
  const resources = sortResourcesForRollback(touchedResources);

  if (resources.length === 0) {
    return { rolledBack: false, resources: [] };
  }

  const rollbackErrors = [];

  const rollbackProgress = (resource, status, completed, extra = {}) => {
    if (status === "error") {
      rollbackErrors.push(extra.errorMessage || resource);
    }

    onProgress?.({
      step: "rollback",
      message: "rollback",
      description:
        status === "done"
          ? `Rollback terminé : ${resource}`
          : status === "error"
            ? `Erreur rollback : ${resource}`
            : `Rollback en cours : ${resource} (${extra.message || ""})`,
      percentage:
        status === "done" ? 100 :
        extra.totalItems ? Math.round((completed / extra.totalItems) * 100) :
        0,
    });
  };

  onProgress?.({
    step: "rollback",
    message: "rollback",
    description: `Rollback en cours : ${resources.join(", ")}`,
    percentage: 0,
  });

  try {
    await resetAllData(resources, rollbackProgress);
  } catch (error) {
    const message = error?.message || "Erreur inconnue";
    rollbackErrors.push(message);
    onProgress?.({
      step: "rollback",
      message: "rollback",
      description: `Rollback échoué : ${message}`,
      percentage: 100,
    });

    return {
      rolledBack: false,
      resources,
      error: new Error(`${label} : ${message}`),
      rollbackErrors,
    };
  }

  if (rollbackErrors.length > 0) {
    const message = rollbackErrors.join(", ");
    onProgress?.({
      step: "rollback",
      message: "rollback",
      description: `Rollback échoué : ${message}`,
      percentage: 100,
    });

    return {
      rolledBack: false,
      resources,
      error: new Error(`${label} : ${message}`),
      rollbackErrors,
    };
  }

  onProgress?.({
    step: "rollback",
    message: "rollback",
    description: "Rollback terminé",
    percentage: 100,
  });

  return {
    rolledBack: true,
    resources,
    rollbackErrors,
  };
};
