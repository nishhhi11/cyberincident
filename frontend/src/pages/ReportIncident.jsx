import { useState } from "react";
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

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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
            <h1>Report Incident</h1>

            <p>
                Report a cybersecurity incident to the support team.
            </p>

            <form
                className="incident-form glass-panel"
                onSubmit={handleSubmit}
            >
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

                <label>Category</label>

                <select
                    className="cyber-input"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    <option value="Phishing">Phishing</option>
                    <option value="Malware">Malware</option>
                    <option value="Account/Security">
                        Account/Security
                    </option>
                    <option value="Suspicious Activity">
                        Suspicious Activity
                    </option>
                    <option value="Network Issue">
                        Network Issue
                    </option>
                    <option value="Other">Other</option>
                </select>

                <label>Description</label>

                <textarea
                    className="cyber-input"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what happened"
                    rows="5"
                    required
                />

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

                <button className="cyber-button primary" type="submit">
                    Report Incident
                </button>

                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
}

export default ReportIncident;
