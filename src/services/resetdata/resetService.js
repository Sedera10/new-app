import { getItems, deleteItem } from "../api";

export const getResourcesToWipe = () => {
    const resourcesLigne = import.meta.env.VITE_RESOURCES_TO_WIPE || "";
    const resourcesToWipe = resourcesLigne.split(',').filter(res => res !== "");
    return resourcesToWipe;
};

export const getIdItems = (response) => {
    const res = Array.isArray(response) ? response : [response];
    return res.map(r => r.id);
}

export async function resetResource(resource) {
    const response = await getItems(resource);
    let idArray = getIdItems(response);

    if (idArray.length > 0) {
        let deletedCount = 0;

        for (const id of idArray) {
            try {
                await deleteItem(resource, id);
                deletedCount++;
            } catch (error) {
                const status = error?.response?.status;

                if (status !== 404 && status !== 405) {
                    throw error;
                }

                if (status === 405) {
                    console.warn(`Suppression ignorée pour ${resource}/${id} (méthode DELETE non autorisée).`);
                } else {
                    console.warn(`Suppression ignorée pour ${resource}/${id} (route introuvable).`);
                }
            }
        }

        console.log(`${resource} vidée. ${deletedCount} élément(s) supprimé(s).`);
        return deletedCount;
    }

    return 0;
}

export async function resetAllData(resources, onProgress) {
    let completed = 0;
    for (const resource of resources) {
        if (onProgress) onProgress(resource, 'loading', completed);
        try {
            const deletedCount = await resetResource(resource);
            completed++;
            if (onProgress) onProgress(resource, 'done', completed, { deletedCount: deletedCount ?? 0 });
        } catch (error) {
            console.error(error);
            completed++;
            if (onProgress) onProgress(resource, 'error', completed, { deletedCount: 0 });
        }
    }
}