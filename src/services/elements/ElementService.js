import { getItem, getItems } from "../api";
import { getModelTableName,getModelFieldName } from "../imports/file1/helper";

export const getElementItems = () => {
    const resourcesLigne = import.meta.env.VITE_ELEMENTS_ITEMS || "";
    const resources = resourcesLigne.split(',').filter(res => res !== "");
    return resources;
};

export const getFieldMap = async (resource, ids = []) => {
    const entries = await Promise.all(
        ids.map(async id => {
            const item = await getItem(resource, id);
            return [id, item.name];
        })
    );
    return Object.fromEntries(entries);
};

export const getModel = (resource) => {
    const table = getModelTableName(resource);
    const modelField = getModelFieldName(resource);
    return {
        table,
        modelField: modelField
    };
};

export const CountElements = async () => {
    const resources = getElementItems();
    const counts = await Promise.all(
        resources.map(async resource => {
            const items = await getItems(resource);
            return items.length;
        })
    );
    return counts.reduce((sum, count) => sum + count, 0);
};

export const getElementImage = async (itemtype, id) => {
    try {
        const links = await getItems(
            `${itemtype}/${id}/Document_Item`
        );
        if (!links.length) {
            return null;
        }

        const document = await getItem(
            "Document",
            links[0].documents_id
        );

        return `http://localhost/glpi/public/front/document.send.php?docid=${document.id}&itemtype=${itemtype}&items_id=${id}`;

    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getIconByType = (type) => {
    const icons = {
        Computer: "bi-pc-display",
        Monitor: "bi-display",
        Printer: "bi-printer",
        Phone: "bi-telephone",
        NetworkEquipment: "bi-router"
    };
    return icons[type] || "bi-box";
};

export const ListeElements = async (page = 1, limit = 20) => {
    try {

        const resources = getElementItems();

        const results = await Promise.all(
            resources.map(async resource => {
                const items = await getItems(resource, {
                    range: `${(page - 1) * limit}-${page * limit - 1}`
                });
                return items.map(item => ({
                    ...item,
                    itemtype: resource,
                }));
            })
        );
        const flat = results.flat();
        
        // TRI GLOBAL (important)
        const sorted = flat.sort((a, b) =>
            new Date(b.date_mod || b.date_creation) -
            new Date(a.date_mod || a.date_creation)
        );

        const stateIds = [...new Set(flat.map(el => el.states_id).filter(Boolean))];
        const locationIds = [...new Set(flat.map(el => el.locations_id).filter(Boolean))];

        const modelIdsByResource = {};
        resources.forEach(resource => {
            const { modelField } = getModel(resource);
            modelIdsByResource[resource] = [
                ...new Set(
                    flat
                        .filter(el => el.itemtype === resource)
                        .map(el => el[modelField])
                        .filter(Boolean)
                )
            ];
        });

        const [statesMap, locationsMap] = await Promise.all([
            getFieldMap("State", stateIds),
            getFieldMap("Location", locationIds)
        ]);
        
        // Les modeles
        const modelMaps = {};
        await Promise.all(
            resources.map(async resource => {
                const { table } = getModel(resource);
                modelMaps[resource] =
                    await getFieldMap(
                        table,
                        modelIdsByResource[resource]
                    );
            })
        );
        // Les images
        const imageMap = {};
        await Promise.all(
            sorted.map(async el => {
                imageMap[`${el.itemtype}-${el.id}`] =
                    await getElementImage(el.itemtype, el.id);
            })
        );

        return sorted.map(el => {
            const { modelField } = getModel(el.itemtype);
            return {
                ...el,
                stateName: statesMap[el.states_id] || "N/A",
                location: locationsMap[el.locations_id] || "N/A",
                model: modelMaps[el.itemtype]?.[el[modelField]] || "N/A",
                image: imageMap[`${el.itemtype}-${el.id}`] || null,
                icon: getIconByType(el.itemtype),
            };
        });

    } catch (error) {
        console.error(error);
        throw error;
    }
};