import React, { useState } from "react";

const SLA_LABELS = {
  critical: "1 Hour SLA",
  high:     "4 Hours SLA",
  medium:   "8 Hours SLA",
  low:      "24 Hours SLA",
};

export default function NewTicketModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]     = useState("medium");
  const [category, setCategory]     = useState("IT");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, priority, category });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">+ CREATE SERVICE TICKET</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="modal-field">
            <label className="modal-label">Ticket Subject</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Provision IAM role for security audit"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div className="modal-field">
              <label className="modal-label">Category</label>
              <select className="modal-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="IT">IT Infrastructure</option>
                <option value="security">Security / Access</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Priority</label>
              <select className="modal-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>
          </div>

          {/* SLA hint */}
          <div
            style={{
              padding: "7px 12px",
              border: "1px solid var(--border)",
              fontSize: "0.72rem",
              color: "var(--green-dim)",
              letterSpacing: "1px",
            }}
          >
            SLA DEADLINE: {SLA_LABELS[priority]}
          </div>

          <div className="modal-field">
            <label className="modal-label">Description / Technical Context</label>
            <textarea
              className="modal-textarea"
              placeholder="User affected, operational impact, steps already attempted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>CANCEL</button>
            <button type="submit" className="btn btn-green">DISPATCH TICKET</button>
          </div>
        </form>
      </div>
    </div>
  );
}
