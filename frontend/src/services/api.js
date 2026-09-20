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

export const createIncident = async (incidentData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(incidentData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create incident");
    }

    return data;
};

export const getTickets = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/tickets`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to get tickets");
    }

    return data;
};

export const createTicket = async (incidentId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            incidentId
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create ticket");
    }

    return data;
};

export const getAssignableUsers = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/auth/assignable-users`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get assignable users"
        );
    }

    return data;
};

export const assignTicket = async (ticketId, userId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/tickets/${ticketId}/assign`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to assign ticket"
        );
    }

    return data;
};

export const updateTicketStatus = async (ticketId, status) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/tickets/${ticketId}/status`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                status
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update ticket status"
        );
    }

    return data;
};

export const resolveTicket = async (ticketId, resolution) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/tickets/${ticketId}/resolve`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                resolution
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to resolve ticket"
        );
    }

    return data;
};

export const getComments = async (ticketId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/comments/${ticketId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get comments"
        );
    }

    return data;
};

export const createComment = async (ticketId, text) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/comments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ticket: ticketId,
                message: text
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to add comment"
        );
    }

    return data;
};

export const getAttachments = async (ticketId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/attachments/${ticketId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get attachments"
        );
    }

    return data;
};

export const uploadAttachment = async (ticketId, file) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("ticket", ticketId);
    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/attachments`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to upload attachment"
        );
    }

    return data;
};

export const getIncidentTimeline = async (incidentId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/audit/incident/${incidentId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get incident timeline"
        );
    }

    return data;
};

export const getSimilarIncidents = async (incidentId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/incidents/${incidentId}/similar`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get similar incidents"
        );
    }

    return data;
};
export const getAuditLogs = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/audit`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to get audit logs");
    }

    return data;
};
