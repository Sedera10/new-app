const API_URL = "http://localhost:3001/status";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    return null;
};

export const fetchStatuses = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await handleResponse(response);
};

export const fetchStatusById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return await handleResponse(response);
};

export const createStatus = async (data) => {
    const payload = {
        ...data,
        glpi_link: data.glpi_link ? parseInt(data.glpi_link, 10) : null,
    };
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return await handleResponse(response);
};

export const updateStatus = async (id, data) => {
    const payload = {
        ...data,
        glpi_link: data.glpi_link ? parseInt(data.glpi_link, 10) : null,
    };
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return await handleResponse(response);
};

export const deleteStatus = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
    return await handleResponse(response);
};