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
        if (resource === 'User') {
            idArray = idArray.filter(id => id > 6);
        }
        if (idArray.length === 0) return;

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
    const resourcesWithIds = [];
    for (const resource of resources) {
        const response = await getItems(resource);
        let idArray = getIdItems(response);

        if (resource === 'User') {
            idArray = idArray.filter(id => id > 6);
        }

        resourcesWithIds.push({ resource, ids: idArray });
    }

    const totalItems = resourcesWithIds.reduce((sum, entry) => sum + entry.ids.length, 0);
    let completedItems = 0;

    for (const entry of resourcesWithIds) {
        const { resource, ids } = entry;
        let deletedCount = 0;

        if (onProgress) {
            onProgress(resource, 'loading', completedItems, {
                totalItems,
                deletedCount: 0,
                resourceTotal: ids.length
            });
        }

        try {
            for (const id of ids) {
                try {
                    await deleteItem(resource, id);
                    deletedCount++;
                } catch (error) {
                    const status = error?.response?.status;

                    if (status !== 404 && status !== 405) {
                        throw error;
                    }

                    if (status === 405) {
                        console.warn(`Suppression ignoree pour ${resource}/${id} (methode DELETE non autorisee).`);
                    } else {
                        console.warn(`Suppression ignoree pour ${resource}/${id} (route introuvable).`);
                    }
                }

                completedItems++;
                if (onProgress) {
                    onProgress(resource, 'loading', completedItems, {
                        totalItems,
                        deletedCount,
                        resourceTotal: ids.length
                    });
                }
            }

            if (onProgress) {
                onProgress(resource, 'done', completedItems, {
                    totalItems,
                    deletedCount
                });
            }
        } catch (error) {
            console.error(error);
            if (onProgress) {
                onProgress(resource, 'error', completedItems, {
                    totalItems,
                    deletedCount
                });
            }
        }
    }
}