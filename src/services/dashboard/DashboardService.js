export const getElementItems = () => {
    const resourcesLigne = import.meta.env.VITE_RESOURCES_TO_WIPE || "";
    const resourcesToWipe = resourcesLigne.split(',').filter(res => res !== "");
    return resourcesToWipe;
};
