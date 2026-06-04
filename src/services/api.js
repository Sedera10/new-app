
import axios from "axios";

const GLPI_BASE_URL = "/apirest.php";
const APP_TOKEN = import.meta.env.VITE_API;

// ------------------------------------------------------------
// Headers de base (sans session)
// ------------------------------------------------------------
const baseHeaders = {
  "Content-Type": "application/json",
  "App-Token": APP_TOKEN,
};

const api = axios.create({
  baseURL: GLPI_BASE_URL,
  headers: baseHeaders,
});

const getAxiosErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage;

// ------------------------------------------------------------
// 1. Initialiser la session → retourne le session_token
// ------------------------------------------------------------
export async function initSession(username, password) {
  const credentials = btoa(`${username}:${password}`);
  const response = await api.get("/initSession", {
    headers: {
      ...baseHeaders,
      Authorization: `Basic ${credentials}`,
    },
  });

  const data = response.data;
  // Stocker le token en mémoire (ne pas utiliser localStorage dans un artifact)
  sessionStorage.setItem("glpi_session_token", data.session_token);
  return data.session_token;
}

// ------------------------------------------------------------
// 2. Fermer la session
// ------------------------------------------------------------
export async function killSession() {
  const sessionToken = sessionStorage.getItem("glpi_session_token");
  if (!sessionToken) return;

  await api.get("/killSession", {
    headers: {
      ...baseHeaders,
      "Session-Token": sessionToken,
    },
  });

  sessionStorage.removeItem("glpi_session_token");
}

// ------------------------------------------------------------
// Headers authentifiés (avec session)
// ------------------------------------------------------------
function authHeaders() {
  const sessionToken = sessionStorage.getItem("glpi_session_token");
  if (!sessionToken) throw new Error("Session non initialisée. Appelez initSession() d'abord.");
  return {
    ...baseHeaders,
    "Session-Token": sessionToken,
  };
}

// ------------------------------------------------------------
// 3. GET — Obtenir une liste de ressources
//    Exemple : getItems("Computer")
//    Exemple : getItems("Computer", { range: "0-10", sort: "name" })
// ------------------------------------------------------------
export async function getItems(resource, params = {}) {
  try {
    const response = await api.get(`/${resource}`, {
      headers: authHeaders(),
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, `Erreur lors de la récupération de ${resource}`));
  }
}

// ------------------------------------------------------------
// 4. GET — Obtenir une ressource par ID
//    Exemple : getItem("Computer", 1)
//    Exemple : getItem("Computer", 1, { with_softwares: true })
// ------------------------------------------------------------
export async function getItem(resource, id, params = {}) {
  try {
    const response = await api.get(`/${resource}/${id}`, {
      headers: authHeaders(),
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, `Erreur lors de la récupération de ${resource}/${id}`));
  }
}

// ------------------------------------------------------------
// 5. POST — Créer une ressource
//    Exemple : createItem("Computer", { name: "PC-001", serial: "SN123" })
//    Exemple : createItem("Ticket", { name: "Problème réseau", content: "..." })
// ------------------------------------------------------------
export async function createItem(resource, payload) {
  try {
    const response = await api.post(
      `/${resource}`,
      { input: payload },
      { headers: authHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, `Erreur lors de la création de ${resource}`));
  }
}

// ------------------------------------------------------------
// 6. PUT — Modifier une ressource existante
//    Exemple : updateItem("Computer", 1, { name: "PC-002" })
// ------------------------------------------------------------
export async function updateItem(resource, id, payload) {
  try {
    const response = await api.put(
      `/${resource}/${id}`,
      { input: payload },
      { headers: authHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, `Erreur lors de la mise à jour de ${resource}/${id}`));
  }
}

// ------------------------------------------------------------
// 7. DELETE — Supprimer une ressource
//    Exemple : deleteItem("Computer", 1)
//    Exemple : deleteItem("Computer", 1, { force_purge: true })
// ------------------------------------------------------------
export async function deleteItem(resource, id, params = {}) {
  try {
    const response = await api.delete(`/${resource}/${id}`, {
      headers: authHeaders(),
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, `Erreur lors de la suppression de ${resource}/${id}`));
  }
}

// ------------------------------------------------------------
// 8. SEARCH — Rechercher avec des critères
//    Exemple : searchItems("Computer", [{ field: 1, searchtype: "contains", value: "PC" }])
// ------------------------------------------------------------
export async function searchItems(resource, criteria = [], params = {}) {
  try {
    const query = new URLSearchParams(params);
    criteria.forEach((criterion, index) => {
      Object.entries(criterion).forEach(([key, value]) => {
        query.append(`criteria[${index}][${key}]`, value);
      });
    });

    const response = await api.get(`/search/${resource}`, {
      headers: authHeaders(),
      params: query,
    });

    return response.data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, `Erreur lors de la recherche dans ${resource}`));
  }
}