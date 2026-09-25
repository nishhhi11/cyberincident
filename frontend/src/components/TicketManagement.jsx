import React, { useState } from "react";

function PriorityBadge({ priority }) {
  const cls =
    priority === "critical" ? "badge-critical" :
    priority === "high"     ? "badge-high"     :
    priority === "medium"   ? "badge-medium"   : "badge-low";
  return <span className={`badge ${cls}`}>{priority}</span>;
}

function StatusBadge({ status }) {
  const cls =
    status === "resolved"    ? "badge-resolved"    :
    status === "escalated"   ? "badge-escalated"   :
    status === "in_progress" ? "badge-in_progress" :
    status === "closed"      ? "badge-closed"      : "badge-open";
  return <span className={`badge ${cls}`}>{status}</span>;
}

function getSLAInfo(deadlineStr, escalated, resolved) {
  if (resolved) return { label: "COMPLETED", color: "var(--text-muted)" };
  if (!deadlineStr) return { label: "N/A", color: "var(--text-muted)" };
  const diff = new Date(deadlineStr) - new Date();
  if (diff <= 0 || escalated) return { label: "BREACHED", color: "var(--red)" };
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  if (mins < 30) return { label: `WARN: ${mins}m left`, color: "var(--red-dim)" };
  return { label: `${hours}h ${mins % 60}m`, color: "var(--green-dim)" };
}

export default function TicketManagement({
  tickets,
  currentRole,
  onNewTicket,
  onEscalateTicket,
  onResolveTicket,
  onAddComment,
  onUploadAttachment,
}) {
  const [searchTerm, setSearchTerm]       = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [selected, setSelected]           = useState(null);
  const [newComment, setNewComment]       = useState("");
  const [commentsMap, setCommentsMap]     = useState({});

  const filtered = tickets.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchSearch   = t.title.toLowerCase().includes(q) ||
                          (t.description || "").toLowerCase().includes(q);
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchStatus   = statusFilter   === "all" || t.status   === statusFilter;
    return matchSearch && matchPriority && matchStatus;
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
      alert(`File "${file.name}" attached to ticket.`);
    }
  };

  const canAct = currentRole === "admin" || currentRole === "security_analyst" || currentRole === "support_agent";

  return (
    <div>
      {/* Toolbar */}
      <div className="section-header">
        <div className="section-title">ITSM SERVICE DESK</div>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="search ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">ALL PRIORITY</option>
            <option value="critical">CRITICAL</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">ALL STATUS</option>
            <option value="open">OPEN</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="escalated">ESCALATED</option>
            <option value="resolved">RESOLVED</option>
            <option value="closed">CLOSED</option>
          </select>
          <button className="btn btn-green btn-sm" onClick={onNewTicket}>
            + NEW
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Category</th>
              <th>SLA</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No tickets match filters.</td></tr>
            ) : (
              filtered.map((t) => {
                const sla = getSLAInfo(t.slaDeadline, t.escalated, t.status === "resolved");
                const isEsc = t.status === "escalated" || t.escalated;
                return (
                  <tr key={t._id} className={isEsc ? "row-escalated" : ""}>
                    <td>
                      <div style={{ fontWeight: 600, color: isEsc ? "var(--red)" : "var(--green)" }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                        [{t.category || "IT"}]
                      </div>
                    </td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {t.category}
                    </td>
                    <td style={{ fontSize: "0.72rem", color: sla.color, whiteSpace: "nowrap" }}>
                      {sla.label}
                    </td>
                    <td style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(t)}>
                          DETAILS
                        </button>
                        {t.status !== "escalated" && t.status !== "resolved" && canAct && (
                          <button
                            className="btn btn-yellow btn-sm"
                            onClick={() => onEscalateTicket(t._id)}
                          >
                            ESC
                          </button>
                        )}
                        {t.status !== "resolved" && canAct && (
                          <button
                            className="btn btn-green btn-sm"
                            onClick={() => onResolveTicket(t._id)}
                          >
                            CLOSE
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
                <PriorityBadge priority={selected.priority} />
                <div className="modal-title" style={{ marginTop: "6px" }}>{selected.title}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>X</button>
            </div>

            {/* SLA status */}
            {(() => {
              const sla = getSLAInfo(selected.slaDeadline, selected.escalated, selected.status === "resolved");
              return (
                <div style={{ fontSize: "0.72rem", color: sla.color, border: "1px solid var(--border)", padding: "6px 10px", letterSpacing: "1px" }}>
                  SLA STATUS: {sla.label}
                  {selected.slaDeadline && (
                    <span style={{ marginLeft: "16px", color: "var(--text-muted)" }}>
                      Deadline: {new Date(selected.slaDeadline).toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Description */}
            <div style={{ color: "var(--text-dim)", fontSize: "0.78rem", lineHeight: "1.7", padding: "10px", border: "1px solid var(--border)" }}>
              {selected.description || "No further details provided."}
            </div>

            {/* Meta */}
            <div style={{ display: "flex", gap: "20px", fontSize: "0.72rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
              <span>STATUS: <strong style={{ color: "var(--text-dim)" }}>{selected.status.toUpperCase()}</strong></span>
              <span>CATEGORY: <strong style={{ color: "var(--text-dim)" }}>{selected.category}</strong></span>
              <span>REPORTER: <strong style={{ color: "var(--text-dim)" }}>{selected.reportedBy?.name || "Unknown"}</strong></span>
            </div>

            {/* Actions */}
            {canAct && selected.status !== "resolved" && (
              <div style={{ display: "flex", gap: "8px" }}>
                {selected.status !== "escalated" && (
                  <button
                    className="btn btn-yellow btn-sm"
                    onClick={() => { onEscalateTicket(selected._id); setSelected(null); }}
                  >
                    ESCALATE
                  </button>
                )}
                <button
                  className="btn btn-green btn-sm"
                  onClick={() => { onResolveTicket(selected._id); setSelected(null); }}
                >
                  MARK RESOLVED
                </button>
              </div>
            )}

            {/* File upload */}
            <div>
              <div className="modal-label" style={{ marginBottom: "6px" }}>ATTACH FILE</div>
              <label style={{ cursor: "pointer", fontSize: "0.75rem", color: "var(--text-muted)", border: "1px dashed var(--border)", padding: "8px 14px", display: "inline-block" }}>
                [+] Upload supporting document
                <input type="file" style={{ display: "none" }} onChange={handleFile} />
              </label>
            </div>

            {/* Comments */}
            <div>
              <div className="modal-label" style={{ marginBottom: "8px" }}>COMMENTS</div>
              <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                {(commentsMap[selected._id] || []).length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>No comments yet.</div>
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
                  placeholder="Add update or resolution note..."
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
