import React, { useState } from "react";

export default function ReportIncidentModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("high");
  const [affectedSystemsInput, setAffectedSystemsInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const affectedSystems = affectedSystemsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({ title, description, severity, affectedSystems });
    setTitle("");
    setDescription("");
    setAffectedSystemsInput("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">! DECLARE SECURITY INCIDENT</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="modal-field">
            <label className="modal-label">Incident Title</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g. Unauthorized lateral movement on port 445"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div className="modal-field">
              <label className="modal-label">Severity Level</label>
              <select className="modal-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Affected Systems (comma separated)</label>
              <input
                type="text"
                className="modal-input"
                placeholder="dc01.corp, app-node-3"
                value={affectedSystemsInput}
                onChange={(e) => setAffectedSystemsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Forensic Details / Attack Indicators</label>
            <textarea
              className="modal-textarea"
              placeholder="IPs, process trees, hashes, compromised accounts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>CANCEL</button>
            <button type="submit" className="btn btn-yellow">BROADCAST INCIDENT</button>
          </div>
        </form>
      </div>
    </div>
  );
}
