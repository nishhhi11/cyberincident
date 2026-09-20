import { useEffect, useState } from "react";
import { getIncidentStats } from "../services/api";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [stats, setStats] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getIncidentStats();
                setStats(data);
            } catch (error) {
                setError(error.message);
            }
        };

        loadStats();
    }, []);

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
        </div>
    );
}

export default Dashboard;
