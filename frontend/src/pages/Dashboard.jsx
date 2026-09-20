import { useEffect, useState } from "react";
import {
    getIncidentStats,
    getIncidents,
    getSimilarIncidents
} from "../services/api";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [stats, setStats] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [similarIncidents, setSimilarIncidents] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const statsData = await getIncidentStats();
                const incidentsData = await getIncidents();

                setStats(statsData);
                setIncidents(incidentsData);
            } catch (error) {
                setError(error.message);
            }
        };

        loadDashboard();
    }, []);

    const loadSimilarIncidents = async (incidentId) => {
        try {
            const data = await getSimilarIncidents(incidentId);

            setSimilarIncidents({
                ...similarIncidents,
                [incidentId]: data.similarIncidents
            });
        } catch (error) {
            setError(error.message);
        }
    };

    const getCount = (status) => {
        const item = stats.find((stat) => stat._id === status);

        return item ? item.count : 0;
    };

    const total = stats.reduce(
        (sum, stat) => sum + stat.count,
        0
    );

    return (
        <div className="dashboard">
            <h1>CyberIncident Dashboard</h1>

            <p>Welcome, {user?.name}</p>
            <p>Role: {user?.role}</p>

            {error && <p>{error}</p>}

            <div className="stats">
                <div className="stat-card">
                    <h3>Total Incidents</h3>
                    <p>{total}</p>
                </div>

                <div className="stat-card">
                    <h3>Open</h3>
                    <p>{getCount("Open")}</p>
                </div>

                <div className="stat-card">
                    <h3>Resolved</h3>
                    <p>{getCount("Resolved")}</p>
                </div>

                <div className="stat-card">
                    <h3>Escalated</h3>
                    <p>{getCount("Escalated")}</p>
                </div>
            </div>

            <div className="recent-incidents">
                <h2>Recent Incidents</h2>

                {incidents.length === 0 ? (
                    <p>No incidents found.</p>
                ) : (
                    incidents.slice(0, 5).map((incident) => (
                        <div
                            className="incident-card"
                            key={incident._id}
                        >
                            <div>
                                <h3>{incident.title}</h3>
                                <p>
                                    {incident.category} ·{" "}
                                    {incident.location}
                                </p>
                            </div>

                            <div>
                                <p>Priority: {incident.priority}</p>
                                <p>Risk Level: {incident.riskLevel}</p>
                                <p>Status: {incident.status}</p>
                            </div>

                            <div style={{ marginTop: "10px" }}>
                                <button
                                    onClick={() =>
                                        loadSimilarIncidents(incident._id)
                                    }
                                    style={{
                                        padding: "8px 14px",
                                        border: "none",
                                        borderRadius: "6px",
                                        background: "#7c3aed",
                                        color: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    Find Similar Incidents
                                </button>

                                {similarIncidents[incident._id] && (
                                    <div
                                        style={{
                                            marginTop: "10px",
                                            padding: "10px",
                                            background: "#0f1117",
                                            borderRadius: "8px"
                                        }}
                                    >
                                        <strong>Similar Incidents</strong>

                                        {similarIncidents[incident._id].length === 0 ? (
                                            <p style={{ color: "#9ca3af" }}>
                                                No similar incidents found.
                                            </p>
                                        ) : (
                                            similarIncidents[incident._id].map(
                                                (similar) => (
                                                    <p key={similar._id}>
                                                        {similar.title} ·{" "}
                                                        {similar.category}
                                                    </p>
                                                )
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;
