const API_URL = "http://localhost:3001/ticket-super-cost";
const REOPENNG_API_URL = "http://localhost:3001/ticket-reopening";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
    }
    return await response.json();
};

export const createSuperCost = async ({ticket_id, cost}) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ticket_id: Number(ticket_id),
            cost: Number(cost)
        })
    })
    return await handleResponse(response);
}

export const fetchSuperCosts = async () => {
    const response = await fetch(API_URL);
    return await handleResponse(response);
}

export const annulerCost = async ({ticket_id}) => {
    const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ticket_id: Number(ticket_id)
        })
    })
    return await handleResponse(response);
}


// ALEA ARIVA

export const createReopeningFee = async ({ticket_id, percentage}) => {
    const response = await fetch(REOPENNG_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ticket_id: Number(ticket_id),
            cost: Number(percentage)
        })
    })
    return await handleResponse(response);
}