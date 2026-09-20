const API_URL = "http://localhost:3000/api";

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

export const getIncidentStats = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/incidents/stats`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to get incident statistics");
    }

    return data;
};

export const getIncidents = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/incidents`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to get incidents");
    }

    return data;
};