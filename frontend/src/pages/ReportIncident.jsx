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

    const getPriorityDetails = () => {
        const { impact, urgency } = formData;

        if (impact === "High" && urgency === "High") {
            return {
                priority: "Critical",
                sla: "2 hours"
            };
        }

        if (impact === "High" || urgency === "High") {
            return {
                priority: "High",
                sla: "6 hours"
            };
        }

        if (impact === "Medium" || urgency === "Medium") {
            return {
                priority: "Medium",
                sla: "12 hours"
            };
        }

        return {
            priority: "Low",
            sla: "24 hours"
        };
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

    const priorityDetails = getPriorityDetails();

    return (
        <div className="report-page">

            <div className="report-header">
                <span className="section-label">
                    SECURITY REPORTING
                </span>

                <h1>Report Incident</h1>

                <p>
                    Report a cybersecurity incident to the support team.
                </p>
            </div>

            <form
                className="incident-form"
                onSubmit={handleSubmit}
            >

                <div className="form-section-title">
                    Incident Details
                </div>

                <label>
                    Incident Title
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter incident title"
                        required
                    />
                </label>

                <div className="form-row">

                    <label>
                        Category
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option>Phishing</option>
                            <option>Malware</option>
                            <option>Account/Security</option>
                            <option>Suspicious Activity</option>
                            <option>Network Issue</option>
                            <option>Other</option>
                        </select>
                    </label>

                    <label>
                        Location
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai Office"
                            required
                        />
                    </label>

                </div>

                <label>
                    Description
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe what happened..."
                        rows="5"
                        required
                    />
                </label>

                <div className="form-row">

                    <label>
                        Impact
                        <select
                            name="impact"
                            value={formData.impact}
                            onChange={handleChange}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </label>

                    <label>
                        Urgency
                        <select
                            name="urgency"
                            value={formData.urgency}
                            onChange={handleChange}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </label>

                </div>

                <div className="priority-preview">

                    <div>
                        <span className="section-label">
                            CALCULATED PRIORITY
                        </span>

                        <strong className="priority-preview-value">
                            {priorityDetails.priority}
                        </strong>
                    </div>

                    <div>
                        <span className="section-label">
                            SLA RESPONSE TIME
                        </span>

                        <strong className="priority-preview-sla">
                            {priorityDetails.sla}
                        </strong>
                    </div>

                </div>

                <button
                    type="submit"
                    className="primary-button"
                >
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