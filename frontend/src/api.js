const API_BASE = "http://localhost:8000";

export const getToken = () => localStorage.getItem("cyber_jwt_token") || "";
export const setToken = (token) => localStorage.setItem("cyber_jwt_token", token);
export const clearToken = () => localStorage.removeItem("cyber_jwt_token");

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("cyber_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem("cyber_user", JSON.stringify(user));
};

const getHeaders = (isMultipart = false) => {
  const token = getToken();
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(name, email, password, role) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    return res.json();
  },

  async getTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tickets?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getTicketStats() {
    const res = await fetch(`${API_BASE}/tickets/stats`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createTicket(data) {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async escalateTicket(id, reason = "Approaching SLA breach") {
    const res = await fetch(`${API_BASE}/tickets/${id}/escalate`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async resolveTicket(id, resolution = "Incident remediated") {
    const res = await fetch(`${API_BASE}/tickets/${id}/resolve`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ resolution }),
    });
    return res.json();
  },

  async getTicketComments(id) {
    const res = await fetch(`${API_BASE}/tickets/${id}/comments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addTicketComment(id, content) {
    const res = await fetch(`${API_BASE}/tickets/${id}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  async uploadTicketAttachment(id, file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/tickets/${id}/attachments`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return res.json();
  },

  async getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/incidents?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getIncidentStats() {
    const res = await fetch(`${API_BASE}/incidents/stats`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async reportIncident(data) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resolveIncident(id, resolution = "Threat mitigated and isolated") {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ resolution }),
    });
    return res.json();
  },

  async getIncidentComments(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}/comments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addIncidentComment(id, content) {
    const res = await fetch(`${API_BASE}/incidents/${id}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  async uploadIncidentAttachment(id, file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/incidents/${id}/attachments`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users/audit-logs?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },
};
