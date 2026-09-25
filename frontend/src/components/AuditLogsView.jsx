import React, { useState } from "react";

export default function AuditLogsView({ auditLogs }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      (log.action || "").toLowerCase().includes(q) ||
      (log.performedBy?.name || "").toLowerCase().includes(q) ||
      (log.targetCollection || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <div className="section-title">IMMUTABLE AUDIT TRAIL</div>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="search action / user / collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="cyber-panel" style={{ padding: 0 }}>
        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 170px 1fr 130px",
            padding: "8px 14px",
            fontSize: "0.65rem",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span>Action</span>
          <span>Actor</span>
          <span>Details</span>
          <span style={{ textAlign: "right" }}>Timestamp</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No audit records found.</div>
        ) : (
          filtered.map((log) => {
            const isDanger =
              log.action?.includes("ESCALATED") ||
              log.action?.includes("BREACH") ||
              log.action?.includes("CRITICAL");
            return (
              <div key={log._id} className="audit-log-row">
                <span className={`audit-action ${isDanger ? "danger" : ""}`}>
                  {log.action || "SYSTEM_EVENT"}
                </span>
                <span className="audit-by">
                  {log.performedBy?.name || "System"}
                  <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.67rem" }}>
                    {log.performedBy?.role || "kernel"}
                  </span>
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  {log.details
                    ? JSON.stringify(log.details).slice(0, 80)
                    : `collection: ${log.targetCollection || "—"}`}
                </span>
                <span className="audit-time" style={{ textAlign: "right", minWidth: "unset" }}>
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
