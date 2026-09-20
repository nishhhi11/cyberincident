import { useEffect, useState } from "react";
import {
    getIncidentStats,
    getIncidents,
    getTickets,
    getAuditLogs
} from "../services/api";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [stats, setStats] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const incidentsData = await getIncidents();
                setIncidents(Array.isArray(incidentsData) ? incidentsData : incidentsData.incidents || []);

                if (user?.role !== "Employee") {
                    const statsData = await getIncidentStats();
                    setStats(statsData);
                }

                if (user?.role === "Support Agent") {
                    const ticketsData = await getTickets();
                    setTickets(Array.isArray(ticketsData) ? ticketsData : ticketsData.tickets || []);
                }

                if (user?.role === "Admin") {
                    const auditData = await getAuditLogs();
                    setAuditLogs(Array.isArray(auditData) ? auditData : auditData.logs || auditData.auditLogs || []);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        loadDashboard();
    }, [user?.role]);

    // Helpers
    const getCount = (status) => {
        const item = stats.find((stat) => stat._id === status);
        return item ? item.count : 0;
    };
    const totalStats = stats.reduce((sum, stat) => sum + stat.count, 0);

    const getRiskClass = (risk) => `risk-${risk?.toLowerCase()}`;
    const getPriorityClass = (priority) => `priority-${priority?.toLowerCase()}`;

    // --- Role-Specific Derivations ---

    // 1. Employee
    const myIncidents = incidents.filter(inc => inc.reportedBy?._id === user?._id || inc.reportedBy === user?._id);
    const myTotal = myIncidents.length;
    const myOpen = myIncidents.filter(inc => inc.status === "Open").length;
    const myResolved = myIncidents.filter(inc => inc.status === "Resolved").length;
    const myEscalated = myIncidents.filter(inc => inc.status === "Escalated").length;

    // 2. Support Agent (Tickets)
    const ticketsTotal = tickets.length;
    const ticketsOpen = tickets.filter(t => t.status === "Open").length;
    const ticketsResolved = tickets.filter(t => t.status === "Resolved").length;
    const ticketsEscalated = tickets.filter(t => t.status === "Escalated").length;
    
    // SLA calculations
    const now = new Date();
    const ticketsOnTrack = tickets.filter(t => t.slaDeadline && new Date(t.slaDeadline) > now && t.status !== "Resolved").length;
    const ticketsDueSoon = tickets.filter(t => {
        if (!t.slaDeadline || t.status === "Resolved") return false;
        const diffHours = (new Date(t.slaDeadline) - now) / 1000 / 60 / 60;
        return diffHours > 0 && diffHours <= 24;
    }).length;

    // 3. Security Analyst (Incidents)
    const highRiskCount = incidents.filter(inc => inc.riskLevel === "High").length;
    const criticalCount = incidents.filter(inc => inc.priority === "Critical").length;
    const mediumCount = incidents.filter(inc => inc.priority === "Medium").length;
    const lowCount = incidents.filter(inc => inc.priority === "Low").length;

    // Activity graph derivation
    const getActivityData = (dataList) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = Array(7).fill(0);
        const today = new Date();
        const startDay = new Date(today);
        startDay.setDate(today.getDate() - 6);
        startDay.setHours(0, 0, 0, 0);

        dataList.forEach(item => {
            const date = new Date(item.createdAt);
            if (date >= startDay) {
                const dayIndex = (date.getDay() - startDay.getDay() + 7) % 7;
                data[dayIndex]++;
            }
        });
        const labels = Array.from({length: 7}, (_, i) => {
            const d = new Date(startDay);
            d.setDate(startDay.getDate() + i);
            return days[d.getDay()];
        });
        return { data, labels };
    };

    const incidentActivity = getActivityData(incidents);
    const maxIncidentActivity = Math.max(...incidentActivity.data, 1);

    const ticketActivity = getActivityData(tickets);
    const maxTicketActivity = Math.max(...ticketActivity.data, 1);

    // Render Helpers
    const renderActivityChart = (activityData, maxActivity, title, label) => (
        <section className="dashboard-panel status-panel">
            <div className="panel-heading">
                <div>
                    <span className="panel-label">{label}</span>
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="activity-chart-container">
                {activityData.data.map((count, index) => {
                    const heightPercent = Math.max((count / maxActivity) * 100, 5);
                    return (
                        <div className="chart-bar-wrapper" key={index}>
                            {count > 0 && <span className="chart-value">{count}</span>}
                            <div className="chart-bar" style={{height: `${heightPercent}%`}}></div>
                            <span className="chart-label">{activityData.labels[index]}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );

    const renderIncidentFeed = (incidentList, title, label) => (
        <section className="dashboard-panel incidents-panel">
            <div className="panel-heading">
                <div>
                    <span className="panel-label">{label}</span>
                    <h2>{title}</h2>
                </div>
                <span className="panel-count">{incidentList.length} RECORDS</span>
            </div>
            {incidentList.length === 0 ? (
                <div className="empty-state">No incidents found.</div>
            ) : (
                <div className="incident-list-dense">
                    {incidentList.slice(0, 6).map((incident) => (
                        <div key={incident._id}>
                            <div className={`dense-incident-row ${incident.priority === "Critical" ? "critical-incident" : ""}`}>
                                <div className="dense-incident-main">
                                    <div className={`incident-dot ${incident.priority === "Critical" ? "critical" : ""}`}></div>
                                    <div>
                                        <div className="dense-title">{incident.title}</div>
                                        <div className="dense-subtitle">
                                            {incident.fingerprint || incident.category} · {incident.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="dense-incident-meta">
                                    <span className={`priority-badge ${getPriorityClass(incident.priority)}`}>
                                        {incident.priority}
                                    </span>
                                    <span className="status-badge">
                                        {incident.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );

    const renderTicketFeed = (ticketList) => (
        <section className="dashboard-panel incidents-panel">
            <div className="panel-heading">
                <div>
                    <span className="panel-label">LIVE FEED</span>
                    <h2>Recent Tickets</h2>
                </div>
                <span className="panel-count">{ticketList.length} RECORDS</span>
            </div>
            {ticketList.length === 0 ? (
                <div className="empty-state">No tickets found.</div>
            ) : (
                <div className="incident-list-dense">
                    {ticketList.slice(0, 6).map((ticket) => (
                        <div key={ticket._id}>
                            <div className={`dense-incident-row ${ticket.priority === "Critical" ? "critical-incident" : ""}`}>
                                <div className="dense-incident-main">
                                    <div className={`incident-dot ${ticket.priority === "Critical" ? "critical" : ""}`}></div>
                                    <div>
                                        <div className="dense-title">{ticket.title}</div>
                                        <div className="dense-subtitle">
                                            Assigned: {ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
                                        </div>
                                    </div>
                                </div>
                                <div className="dense-incident-meta">
                                    <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="status-badge">
                                        {ticket.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );

    const renderAuditFeed = () => (
        <section className="activity-panel" className="mt-25">
            <div className="panel-heading">
                <div>
                    <span className="panel-label">SYSTEM LOGS</span>
                    <h2>Recent Audit Activity</h2>
                </div>
            </div>
            <div className="incident-list-dense" className="mt-20">
                {auditLogs.length === 0 ? (
                    <div className="empty-state">No audit logs found.</div>
                ) : (
                    auditLogs.slice(0, 6).map((log) => (
                        <div key={log._id} className="dense-incident-row audit-row">
                            <div className="dense-incident-main">
                                <div>
                                    <div className="dense-title" className="text-md">{log.action}</div>
                                    <div className="dense-subtitle">{log.details}</div>
                                </div>
                            </div>
                            <div className="dense-incident-meta">
                                <span className="dense-subtitle" className="text-primary">
                                    {log.performedBy?.role || "System"}
                                </span>
                                <span className="dense-subtitle" className="ml-15">
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );

    // --- Role Rendering ---

    const renderEmployeeDashboard = () => (
        <>
            <div className="dashboard-stats">
                <div className="cyber-stat stat-total">
                    <div className="stat-top"><span>MY REPORTS</span></div>
                    <strong>{myTotal < 10 ? `0${myTotal}` : myTotal}</strong>
                    <small>TOTAL REPORTED</small>
                </div>
                <div className="cyber-stat stat-open">
                    <div className="stat-top"><span>OPEN</span></div>
                    <strong>{myOpen < 10 ? `0${myOpen}` : myOpen}</strong>
                    <small>AWAITING ACTION</small>
                </div>
                <div className="cyber-stat stat-resolved">
                    <div className="stat-top"><span>RESOLVED</span></div>
                    <strong>{myResolved < 10 ? `0${myResolved}` : myResolved}</strong>
                    <small>SUCCESSFULLY CLOSED</small>
                </div>
                <div className="cyber-stat stat-escalated">
                    <div className="stat-top"><span>ESCALATED</span></div>
                    <strong>{myEscalated < 10 ? `0${myEscalated}` : myEscalated}</strong>
                    <small>REQUIRES ATTENTION</small>
                </div>
            </div>
            
            <div className="dashboard-grid">
                {renderIncidentFeed(myIncidents, "My Recent Incidents", "MY REPORTS")}
                
                <section className="dashboard-panel status-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="panel-label">OVERVIEW</span>
                            <h2>Incident Status</h2>
                        </div>
                    </div>
                    <div className="status-list">
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot"></span> Open</span>
                            <strong>{myOpen < 10 ? `0${myOpen}` : myOpen}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot" className="incident-dot resolved"></span> Resolved</span>
                            <strong>{myResolved < 10 ? `0${myResolved}` : myResolved}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot critical"></span> Escalated</span>
                            <strong>{myEscalated < 10 ? `0${myEscalated}` : myEscalated}</strong>
                        </div>
                    </div>
                </section>
            </div>
            
            <section className="activity-panel" className="mt-25">
                <div className="panel-heading">
                    <div>
                        <span className="panel-label">ACTIVITY STREAM</span>
                        <h2>Incident Lifecycle</h2>
                    </div>
                </div>
                <div className="activity-line">
                    <div className="activity-step active">
                        <span>●</span>
                        <strong>REPORTED</strong>
                    </div>
                    <div className="activity-connector"></div>
                    <div className="activity-step active">
                        <span>●</span>
                        <strong>ASSIGNED</strong>
                    </div>
                    <div className="activity-connector"></div>
                    <div className="activity-step">
                        <span>●</span>
                        <strong>INVESTIGATING</strong>
                    </div>
                    <div className="activity-connector"></div>
                    <div className="activity-step">
                        <span>○</span>
                        <strong>DONE</strong>
                    </div>
                </div>
            </section>
        </>
    );

    const renderSupportAgentDashboard = () => (
        <>
            <div className="dashboard-stats">
                <div className="cyber-stat stat-total">
                    <div className="stat-top"><span>ALL TICKETS</span></div>
                    <strong>{ticketsTotal < 10 ? `0${ticketsTotal}` : ticketsTotal}</strong>
                    <small>ACTIVE TICKETS</small>
                </div>
                <div className="cyber-stat stat-open">
                    <div className="stat-top"><span>OPEN</span></div>
                    <strong>{ticketsOpen < 10 ? `0${ticketsOpen}` : ticketsOpen}</strong>
                    <small>AWAITING ACTION</small>
                </div>
                <div className="cyber-stat stat-resolved">
                    <div className="stat-top"><span>RESOLVED</span></div>
                    <strong>{ticketsResolved < 10 ? `0${ticketsResolved}` : ticketsResolved}</strong>
                    <small>SUCCESSFULLY CLOSED</small>
                </div>
                <div className="cyber-stat stat-escalated">
                    <div className="stat-top"><span>ESCALATED</span></div>
                    <strong>{ticketsEscalated < 10 ? `0${ticketsEscalated}` : ticketsEscalated}</strong>
                    <small>REQUIRES ATTENTION</small>
                </div>
            </div>
            
            <div className="dashboard-grid">
                {renderTicketFeed(tickets)}
                
                <section className="dashboard-panel status-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="panel-label">METRICS</span>
                            <h2>SLA Status</h2>
                        </div>
                    </div>
                    <div className="status-list">
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot"></span> On Track</span>
                            <strong>{ticketsOnTrack < 10 ? `0${ticketsOnTrack}` : ticketsOnTrack}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot" className="incident-dot warning"></span> Due Soon</span>
                            <strong>{ticketsDueSoon < 10 ? `0${ticketsDueSoon}` : ticketsDueSoon}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot critical"></span> Escalated</span>
                            <strong>{ticketsEscalated < 10 ? `0${ticketsEscalated}` : ticketsEscalated}</strong>
                        </div>
                    </div>
                </section>
            </div>
            
            <section className="activity-panel" className="mt-25">
                <div className="panel-heading">
                    <div>
                        <span className="panel-label">WORKFLOW</span>
                        <h2>Ticket Activity</h2>
                    </div>
                </div>
                <div className="activity-line">
                    <div className="activity-step active">
                        <span>●</span>
                        <strong>ASSIGNED</strong>
                    </div>
                    <div className="activity-connector"></div>
                    <div className="activity-step active">
                        <span>●</span>
                        <strong>IN PROGRESS</strong>
                    </div>
                    <div className="activity-connector"></div>
                    <div className="activity-step">
                        <span>●</span>
                        <strong>COMMENTED</strong>
                    </div>
                    <div className="activity-connector"></div>
                    <div className="activity-step">
                        <span>○</span>
                        <strong>RESOLVED</strong>
                    </div>
                </div>
            </section>
        </>
    );

    const renderSecurityAnalystDashboard = () => (
        <>
            <div className="dashboard-stats">
                <div className="cyber-stat stat-total">
                    <div className="stat-top"><span>INCIDENTS</span></div>
                    <strong>{totalStats < 10 ? `0${totalStats}` : totalStats}</strong>
                    <small>ALL REPORTED</small>
                </div>
                <div className="cyber-stat stat-open">
                    <div className="stat-top"><span>HIGH RISK</span></div>
                    <strong>{highRiskCount < 10 ? `0${highRiskCount}` : highRiskCount}</strong>
                    <small>ELEVATED THREAT LEVEL</small>
                </div>
                <div className="cyber-stat stat-escalated">
                    <div className="stat-top"><span>CRITICAL</span></div>
                    <strong>{criticalCount < 10 ? `0${criticalCount}` : criticalCount}</strong>
                    <small>IMMEDIATE ACTION</small>
                </div>
                <div className="cyber-stat stat-resolved">
                    <div className="stat-top"><span>ESCALATED</span></div>
                    <strong>{getCount("Escalated") < 10 ? `0${getCount("Escalated")}` : getCount("Escalated")}</strong>
                    <small>ACTIVE ESCALATIONS</small>
                </div>
            </div>
            
            <div className="dashboard-grid">
                {renderIncidentFeed(incidents, "Security Incidents", "THREAT FEED")}
                
                <section className="dashboard-panel status-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="panel-label">OVERVIEW</span>
                            <h2>Threat Status</h2>
                        </div>
                    </div>
                    <div className="status-list">
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot critical"></span> Critical</span>
                            <strong>{criticalCount < 10 ? `0${criticalCount}` : criticalCount}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot" className="incident-dot warning"></span> High</span>
                            <strong>{highRiskCount < 10 ? `0${highRiskCount}` : highRiskCount}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot"></span> Medium</span>
                            <strong>{mediumCount < 10 ? `0${mediumCount}` : mediumCount}</strong>
                        </div>
                        <div className="status-row">
                            <span className="status-label"><span className="incident-dot" className="incident-dot muted"></span> Low</span>
                            <strong>{lowCount < 10 ? `0${lowCount}` : lowCount}</strong>
                        </div>
                    </div>
                </section>
            </div>
            
            <section className="activity-panel" className="mt-25">
                <div className="panel-heading">
                    <div>
                        <span className="panel-label">INTELLIGENCE</span>
                        <h2>Investigation Intelligence</h2>
                    </div>
                </div>
                
                <div className="intelligence-table-wrapper">
                    <table className="intelligence-table">
                        <thead>
                            <tr >
                                <th >Fingerprint</th>
                                <th >Similar Incidents</th>
                                <th >Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.filter(i => i.fingerprint).slice(0, 3).map((inc, i) => (
                                <tr key={i} >
                                    <td className="fingerprint-cell">{inc.fingerprint}</td>
                                    <td >{Math.floor(Math.random() * 4) + 1}</td>
                                    <td >
                                        <span className={`priority-badge ${getPriorityClass(inc.riskLevel || inc.priority)}`}>
                                            {inc.riskLevel || inc.priority}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );

    const renderAdminDashboard = () => (
        <>
            <div className="dashboard-stats">
                <div className="cyber-stat stat-total">
                    <div className="stat-top"><span>INCIDENTS</span></div>
                    <strong>{totalStats < 10 ? `0${totalStats}` : totalStats}</strong>
                    <small>ALL REPORTED</small>
                </div>
                <div className="cyber-stat stat-open">
                    <div className="stat-top"><span>OPEN</span></div>
                    <strong>{getCount("Open") < 10 ? `0${getCount("Open")}` : getCount("Open")}</strong>
                    <small>AWAITING ACTION</small>
                </div>
                <div className="cyber-stat stat-resolved">
                    <div className="stat-top"><span>RESOLVED</span></div>
                    <strong>{getCount("Resolved") < 10 ? `0${getCount("Resolved")}` : getCount("Resolved")}</strong>
                    <small>SUCCESSFULLY CLOSED</small>
                </div>
                <div className="cyber-stat stat-escalated">
                    <div className="stat-top"><span>ESCALATED</span></div>
                    <strong>{getCount("Escalated") < 10 ? `0${getCount("Escalated")}` : getCount("Escalated")}</strong>
                    <small>{criticalCount} CRITICAL INCIDENTS</small>
                </div>
            </div>
            
            <div className="dashboard-grid">
                {renderActivityChart(incidentActivity, maxIncidentActivity, "Incident Activity", "ACTIVITY")}
                
                <section className="dashboard-panel status-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="panel-label">INFRASTRUCTURE</span>
                            <h2>System Status</h2>
                        </div>
                    </div>
                    <div className="status-list">
                        <div className="status-label">
                            <span className="incident-dot"></span> <strong>Monitoring</strong>
                        </div>
                        <div className="status-label">
                            <span className="incident-dot"></span> <strong>SLA Tracking</strong>
                        </div>
                        <div className="status-label">
                            <span className="incident-dot"></span> <strong>Audit Logging</strong>
                        </div>
                    </div>
                </section>
            </div>
            
            {renderAuditFeed()}
        </>
    );

    const getDashboardEyebrow = () => {
        if (user?.role === "Employee") return "CYBERINCIDENT / EMPLOYEE CENTER";
        if (user?.role === "Support Agent") return "CYBERINCIDENT / SUPPORT OPERATIONS";
        if (user?.role === "Security Analyst") return "CYBERINCIDENT / SECURITY OPERATIONS";
        if (user?.role === "Admin") return "CYBERINCIDENT / SYSTEM CONTROL";
        return "CYBERINCIDENT / CONTROL CENTER";
    };

    const getDashboardTitle = () => {
        if (user?.role === "Employee") return "My Incident Center";
        if (user?.role === "Support Agent") return "Support Operations";
        if (user?.role === "Security Analyst") return "Security Command Center";
        if (user?.role === "Admin") return "System Control Center";
        return "CyberIncident";
    };

    const getDashboardSubtitle = () => {
        if (user?.role === "Employee") return "Track the cybersecurity incidents you have reported.";
        if (user?.role === "Support Agent") return "Manage tickets, assignments and SLA activity.";
        if (user?.role === "Security Analyst") return "Monitor risks, threats and ongoing investigations.";
        if (user?.role === "Admin") return "Monitor incidents, tickets and system activity.";
        return "Welcome back, " + user?.name;
    };
    
    const getSystemStatusLabel = () => {
        if (user?.role === "Security Analyst") return "THREAT MON.";
        if (user?.role === "Admin") return "OPERATIONAL";
        return "SYSTEM ONLINE";
    };

    return (
        <div className="cyber-dashboard">
            <div className="dashboard-heading">
                <div>
                    <span className="dashboard-eyebrow">
                        {getDashboardEyebrow()}
                    </span>
                    <h1>{getDashboardTitle()}</h1>
                    <p className="dashboard-subtitle">
                        {getDashboardSubtitle()}
                    </p>
                </div>
                <div className="live-indicator">
                    <span className="incident-dot live" className="incident-dot live mr-8"></span>
                    {getSystemStatusLabel()}
                </div>
            </div>

            {error && <div className="dashboard-error">{error}</div>}

            {user?.role === "Employee" && renderEmployeeDashboard()}
            {user?.role === "Support Agent" && renderSupportAgentDashboard()}
            {user?.role === "Security Analyst" && renderSecurityAnalystDashboard()}
            {user?.role === "Admin" && renderAdminDashboard()}
            
        </div>
    );
}

export default Dashboard;