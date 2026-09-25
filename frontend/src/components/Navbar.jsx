import React from "react";

export default function Navbar({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenReportIncident,
  onOpenNewTicket,
}) {
  return (
    <header>
      {/* Top bar */}
      <div className="top-nav">
        <div className="nav-brand">
          CYBER-OPS <span>//</span> COMMAND CENTER
        </div>

        {/* Status indicators */}
        <div style={{ display: "flex", gap: "18px", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "1px" }}>
          <span style={{ color: "var(--green)" }}>● SYSTEM ONLINE</span>
          <span style={{ color: "var(--green)" }}>● MONGODB: CONNECTED</span>
          <span style={{ color: "var(--red-dim)" }}>● SLA CRON: 15M</span>
        </div>

        {/* Role switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.72rem" }}>
          <span style={{ color: "var(--text-muted)", letterSpacing: "1px" }}>
            ROLE:
          </span>
          <select
            className="role-selector"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            <option value="admin">ADMIN</option>
            <option value="security_analyst">SECURITY ANALYST</option>
            <option value="support_agent">SUPPORT AGENT</option>
            <option value="employee">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {/* Nav tabs + action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
        }}
      >
        <div className="nav-tabs">
          {[
            { key: "dashboard", label: "DASHBOARD" },
            { key: "incidents", label: "INCIDENTS" },
            { key: "tickets",   label: "TICKETS" },
            ...(currentRole === "admin" ? [{ key: "audit", label: "AUDIT LOGS" }] : []),
          ].map((t) => (
            <button
              key={t.key}
              className={`nav-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => onTabChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button className="btn btn-yellow btn-sm" onClick={onOpenReportIncident}>
            ! REPORT INCIDENT
          </button>
          <button className="btn btn-green btn-sm" onClick={onOpenNewTicket}>
            + NEW TICKET
          </button>
        </div>
      </div>
    </header>
  );
}
