import { useState, useEffect } from "react";
import { createIncident } from "../services/api";

function ReportIncident() {
    const [formData, setFormData] = useState({
        title: "",
        category: "Phishing",
        description: "",
        location: "",
        impact: "Low",
        urgency: "Low"
    });

    const [priorityPreview, setPriorityPreview] = useState({ priority: "Low", sla: 24 });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const { impact, urgency } = formData;
        let priority = 'Low';
        let sla = 24;

        if (impact === 'High' && urgency === 'High') {
            priority = 'Critical';
            sla = 2;
        } else if (
            (impact === 'High' && urgency === 'Medium') ||
            (impact === 'Medium' && urgency === 'High')
        ) {
            priority = 'High';
            sla = 6;
        } else if (
            (impact === 'Medium' && urgency === 'Medium') ||
            (impact === 'High' && urgency === 'Low') ||
            (impact === 'Low' && urgency === 'High')
        ) {
            priority = 'Medium';
            sla = 12;
        }

        setPriorityPreview({ priority, sla });
    }, [formData.impact, formData.urgency]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            await createIncident(formData);
            setMessage("Incident reported successfully");
            setFormData({
                title: "",
                category: "Phishing",
                description: "",
                location: "",
                impact: "Low",
                urgency: "Low"
            });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="report-page">
            <div className="report-header">
                <h1>Report Incident</h1>
                <p className="text-muted">Report a cybersecurity incident to the support team.</p>
            </div>

            {message && <div className="cyber-alert success mt-20">{message}</div>}
            {error && <div className="cyber-alert error mt-20">{error}</div>}

            <form className="incident-form-grid mt-25" onSubmit={handleSubmit}>
                <div className="form-main-column glass-panel">
                    <h3 className="form-section-title">Incident Details</h3>
                    
                    <div className="form-group mt-20">
                        <label>Incident Title</label>
                        <input
                            className="cyber-input"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter incident title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            className="cyber-input"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="Phishing">Phishing</option>
                            <option value="Malware">Malware</option>
                            <option value="Account/Security">Account/Security</option>
                            <option value="Suspicious Activity">Suspicious Activity</option>
                            <option value="Network Issue">Network Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            className="cyber-input"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Example: Computer Lab"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="cyber-input"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what happened"
                            rows="6"
                            required
                        />
                    </div>
                </div>

                <div className="form-side-column">
                    <div className="glass-panel">
                        <h3 className="form-section-title">Severity Assessment</h3>
                        
                        <div className="form-group mt-20">
                            <label>Impact</label>
                            <select
                                className="cyber-input"
                                name="impact"
                                value={formData.impact}
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Urgency</label>
                            <select
                                className="cyber-input"
                                name="urgency"
                                value={formData.urgency}
                                onChange={handleChange}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="priority-preview-box mt-25">
                            <h4>Priority Preview</h4>
                            <div className={`priority-result priority-${priorityPreview.priority.toLowerCase()}`}>
                                <div className={`incident-dot ${priorityPreview.priority === 'Critical' ? 'critical' : ''}`}></div>
                                <div className="priority-details">
                                    <strong>{priorityPreview.priority}</strong>
                                    <span>Estimated SLA: {priorityPreview.sla} Hours</span>
                                </div>
                            </div>
                            <p className="text-muted mt-20" style={{fontSize: '0.85rem'}}>
                                Priority is automatically calculated based on the selected impact and urgency matrix.
                            </p>
                        </div>
                    </div>

                    <button className="cyber-button primary submit-incident-btn mt-20" type="submit">
                        Submit Incident Report
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReportIncident;
