import React, { useState } from "react";

function SeverityBadge({ severity }) {
  const cls =
    severity === "critical" ? "badge-critical" :
    severity === "high"     ? "badge-high"     :
    severity === "medium"   ? "badge-medium"   : "badge-low";
  return <span className={`badge ${cls}`}>{severity}</span>;
}

function StatusBadge({ status }) {
  const cls =
    status === "resolved"     ? "badge-resolved"     :
    status === "contained"    ? "badge-contained"    :
    status === "investigating"? "badge-investigating" : "badge-reported";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function IncidentManagement({
  incidents,
  currentRole,
  onReportIncident,
  onResolveIncident,
  onAddComment,
  onUploadAttachment,
}) {
  const [searchTerm, setSearchTerm]       = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [selected, setSelected]           = useState(null);
  const [newComment, setNewComment]       = useState("");
  const [commentsMap, setCommentsMap]     = useState({});

  const filtered = incidents.filter((inc) => {
    const q = searchTerm.toLowerCase();
    const matchSearch  = inc.title.toLowerCase().includes(q) ||
                         (inc.description || "").toLowerCase().includes(q);
    const matchSev     = severityFilter === "all" || inc.severity === severityFilter;
    const matchStatus  = statusFilter   === "all" || inc.status   === statusFilter;
    return matchSearch && matchSev && matchStatus;
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selected) return;
    const entry = {
      _id: "c-" + Date.now(),
      author: { name: `You (${currentRole})` },
      content: newComment,
      createdAt: new Date().toISOString(),
    };
    setCommentsMap((p) => ({ ...p, [selected._id]: [...(p[selected._id] || []), entry] }));
    onAddComment(selected._id, newComment);
    setNewComment("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file && selected) {
      onUploadAttachment(selected._id, file);
      alert(`File "${file.name}" attached to incident.`);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="section-header">
        <div className="section-title">SECURITY INCIDENT REGISTRY</div>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="search threat / host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="all">ALL SEVERITY</option>
            <option value="critical">CRITICAL</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">ALL STATUS</option>
            <option value="reported">REPORTED</option>
            <option value="investigating">INVESTIGATING</option>
            <option value="contained">CONTAINED</option>
            <option value="resolved">RESOLVED</option>
          </select>
          <button className="btn btn-yellow btn-sm" onClick={onReportIncident}>
            ! REPORT
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title / ID</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Affected Systems</th>
              <th>Reporter</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No incidents match current filters.</td></tr>
            ) : (
              filtered.map((inc) => (
                <tr
                  key={inc._id}
                  className={inc.severity === "critical" ? "row-escalated" : ""}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--green)" }}>{inc.title}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                      {String(inc._id).slice(0, 12)}...
                    </div>
                  </td>
                  <td><SeverityBadge severity={inc.severity} /></td>
                  <td><StatusBadge status={inc.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(inc.affectedSystems || []).map((s, i) => (
                        <span key={i} style={{ fontSize: "0.67rem", color: "var(--green-dim)", border: "1px solid var(--border)", padding: "1px 5px" }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.72rem" }}>{inc.reportedBy?.name || "Sensor"}</td>
                  <td style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {new Date(inc.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(inc)}>
                        DETAILS
                      </button>
                      {inc.status !== "resolved" && (currentRole === "admin" || currentRole === "security_analyst") && (
                        <button className="btn btn-green btn-sm" onClick={() => onResolveIncident(inc._id)}>
                          RESOLVE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <SeverityBadge severity={selected.severity} />
                <div className="modal-title" style={{ marginTop: "6px" }}>{selected.title}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>X</button>
            </div>

            <div style={{ color: "var(--text-dim)", fontSize: "0.78rem", lineHeight: "1.7", padding: "10px", border: "1px solid var(--border)" }}>
              {selected.description || "No further details."}
            </div>

            <div style={{ display: "flex", gap: "20px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <span>STATUS: <strong style={{ color: "var(--text-dim)" }}>{selected.status.toUpperCase()}</strong></span>
              <span>SYSTEMS: <strong style={{ color: "var(--green-dim)" }}>
                {(selected.affectedSystems || ["N/A"]).join(", ")}
              </strong></span>
            </div>

            {/* File upload */}
            <div>
              <div className="modal-label" style={{ marginBottom: "6px" }}>ATTACH EVIDENCE</div>
              <label style={{ cursor: "pointer", fontSize: "0.75rem", color: "var(--text-muted)", border: "1px dashed var(--border)", padding: "8px 14px", display: "inline-block" }}>
                [+] Upload log / screenshot / memory dump
                <input type="file" style={{ display: "none" }} onChange={handleFile} />
              </label>
            </div>

            {/* Comments */}
            <div>
              <div className="modal-label" style={{ marginBottom: "8px" }}>TRIAGE LOG / COMMENTS</div>
              <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                {(commentsMap[selected._id] || []).length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>No notes yet.</div>
                ) : (
                  (commentsMap[selected._id] || []).map((c) => (
                    <div key={c._id} style={{ padding: "6px 10px", border: "1px solid var(--border)", fontSize: "0.75rem" }}>
                      <div style={{ color: "var(--green-dim)", marginBottom: "2px", fontSize: "0.68rem" }}>
                        {c.author?.name} — {new Date(c.createdAt).toLocaleTimeString()}
                      </div>
                      <div style={{ color: "var(--text-dim)" }}>{c.content}</div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handlePostComment} className="comment-form">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Add analysis note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-green btn-sm">POST</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
