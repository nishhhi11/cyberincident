import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DashboardOverview from "./components/DashboardOverview";
import IncidentManagement from "./components/IncidentManagement";
import TicketManagement from "./components/TicketManagement";
import AuditLogsView from "./components/AuditLogsView";
import ReportIncidentModal from "./components/ReportIncidentModal";
import NewTicketModal from "./components/NewTicketModal";
import { initialTelemetry } from "./mockData";
import { api, setToken } from "./api";

export default function App() {
  const [currentRole, setCurrentRole] = useState("admin");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [incidents, setIncidents] = useState(initialTelemetry.sampleIncidents);
  const [tickets, setTickets] = useState(initialTelemetry.sampleTickets);
  const [auditLogs, setAuditLogs] = useState(initialTelemetry.sampleAuditLogs);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    async function initializeBackend() {
      try {
        const demoEmail = "admin@cyber.corp";
        const demoPassword = "AdminSecurePassword123!";

        try {
          await api.register("Command Admin", demoEmail, demoPassword, "admin");
        } catch {
        }

        const loginRes = await api.login(demoEmail, demoPassword);
        if (loginRes.token) {
          setToken(loginRes.token);
        }

        const ticketData = await api.getTickets();
        if (ticketData && ticketData.tickets && ticketData.tickets.length > 0) {
          setTickets(ticketData.tickets);
        }

        const incidentData = await api.getIncidents();
        if (incidentData && incidentData.incidents && incidentData.incidents.length > 0) {
          setIncidents(incidentData.incidents);
        }

        const auditData = await api.getAuditLogs();
        if (auditData && auditData.logs && auditData.logs.length > 0) {
          setAuditLogs(auditData.logs);
        }
      } catch (err) {
        console.log("Using local telemetry session:", err.message);
      }
    }

    initializeBackend();
  }, []);

  const handleReportIncident = async (newIncidentData) => {
    try {
      let created = null;
      try {
        created = await api.reportIncident(newIncidentData);
      } catch {
      }

      const item = created?._id
        ? created
        : {
            _id: "inc-" + Date.now(),
            ...newIncidentData,
            status: "reported",
            reportedBy: { name: `Agent (${currentRole})`, role: currentRole },
            createdAt: new Date().toISOString(),
          };

      setIncidents((prev) => [item, ...prev]);

      const auditEntry = {
        _id: "aud-" + Date.now(),
        action: "INCIDENT_REPORTED",
        performedBy: { name: `Console Operator`, role: currentRole },
        targetCollection: "incidents",
        details: { title: item.title, severity: item.severity },
        createdAt: new Date().toISOString(),
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    } catch (err) {
      console.error("Error creating incident:", err);
    }
  };

  const handleNewTicket = async (newTicketData) => {
    try {
      let created = null;
      try {
        created = await api.createTicket(newTicketData);
      } catch {
      }

      const slaHours = { critical: 1, high: 4, medium: 8, low: 24 };
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + (slaHours[newTicketData.priority] || 8));

      const item = created?._id
        ? created
        : {
            _id: "tick-" + Date.now(),
            ...newTicketData,
            status: "open",
            slaDeadline: deadline.toISOString(),
            escalated: false,
            reportedBy: { name: `Console Operator`, role: currentRole },
            createdAt: new Date().toISOString(),
          };

      setTickets((prev) => [item, ...prev]);

      const auditEntry = {
        _id: "aud-" + Date.now(),
        action: "TICKET_CREATED",
        performedBy: { name: `Console Operator`, role: currentRole },
        targetCollection: "tickets",
        details: { title: item.title, priority: item.priority },
        createdAt: new Date().toISOString(),
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    } catch (err) {
      console.error("Error creating ticket:", err);
    }
  };

  const handleEscalateTicket = async (id) => {
    try {
      await api.escalateTicket(id, "Manual supervisor escalation triggered");
    } catch {
    }

    setTickets((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status: "escalated", escalated: true } : t
      )
    );

    setAuditLogs((prev) => [
      {
        _id: "aud-" + Date.now(),
        action: "TICKET_ESCALATED",
        performedBy: { name: `Operator`, role: currentRole },
        targetCollection: "tickets",
        details: { ticketId: id, manual: true },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleResolveTicket = async (id) => {
    try {
      await api.resolveTicket(id, "Remediation applied and verified");
    } catch {
    }

    setTickets((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status: "resolved", resolvedAt: new Date().toISOString() } : t
      )
    );

    setAuditLogs((prev) => [
      {
        _id: "aud-" + Date.now(),
        action: "TICKET_RESOLVED",
        performedBy: { name: `Operator`, role: currentRole },
        targetCollection: "tickets",
        details: { ticketId: id },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleResolveIncident = async (id) => {
    try {
      await api.resolveIncident(id, "Host quarantined and process killed");
    } catch {
    }

    setIncidents((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, status: "resolved", resolvedAt: new Date().toISOString() } : i
      )
    );

    setAuditLogs((prev) => [
      {
        _id: "aud-" + Date.now(),
        action: "INCIDENT_RESOLVED",
        performedBy: { name: `Analyst`, role: currentRole },
        targetCollection: "incidents",
        details: { incidentId: id },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleAddComment = async (entityId, content) => {
    try {
      if (activeTab === "incidents") {
        await api.addIncidentComment(entityId, content);
      } else {
        await api.addTicketComment(entityId, content);
      }
    } catch {
    }

    setAuditLogs((prev) => [
      {
        _id: "aud-" + Date.now(),
        action: "COMMENT_ADDED",
        performedBy: { name: `User`, role: currentRole },
        targetCollection: activeTab === "incidents" ? "incidents" : "tickets",
        details: { entityId, length: content.length },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleUploadAttachment = async (entityId, file) => {
    try {
      if (activeTab === "incidents") {
        await api.uploadIncidentAttachment(entityId, file);
      } else {
        await api.uploadTicketAttachment(entityId, file);
      }
    } catch {
    }

    setAuditLogs((prev) => [
      {
        _id: "aud-" + Date.now(),
        action: "ATTACHMENT_UPLOADED",
        performedBy: { name: `User`, role: currentRole },
        targetCollection: "attachments",
        details: { filename: file.name, size: file.size },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="app-container">
      {/* Top Navigation & Telemetry HUD */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenReportIncident={() => setIsReportModalOpen(true)}
        onOpenNewTicket={() => setIsTicketModalOpen(true)}
      />

      {/* Main Workspace Tabs */}
      <main className="main-content">
        {activeTab === "dashboard" && (
          <DashboardOverview
            telemetry={telemetry}
            incidents={incidents}
            tickets={tickets}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "incidents" && (
          <IncidentManagement
            incidents={incidents}
            currentRole={currentRole}
            onReportIncident={() => setIsReportModalOpen(true)}
            onResolveIncident={handleResolveIncident}
            onAddComment={handleAddComment}
            onUploadAttachment={handleUploadAttachment}
          />
        )}

        {activeTab === "tickets" && (
          <TicketManagement
            tickets={tickets}
            currentRole={currentRole}
            onNewTicket={() => setIsTicketModalOpen(true)}
            onEscalateTicket={handleEscalateTicket}
            onResolveTicket={handleResolveTicket}
            onAddComment={handleAddComment}
            onUploadAttachment={handleUploadAttachment}
          />
        )}

        {activeTab === "audit" && (
          <AuditLogsView auditLogs={auditLogs} />
        )}
      </main>

      {/* Modals */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportIncident}
      />

      <NewTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleNewTicket}
      />
    </div>
  );
}
