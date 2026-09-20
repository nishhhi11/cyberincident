import { useEffect, useState } from "react";
import {
    getTickets,
    getAssignableUsers,
    assignTicket,
    updateTicketStatus,
    resolveTicket,
    getComments,
    createComment,
    getAttachments,
    uploadAttachment,
    getIncidentTimeline
} from "../services/api";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const [resolutions, setResolutions] = useState({});
    
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [attachments, setAttachments] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [timelines, setTimelines] = useState({});
    
    const [activeTab, setActiveTab] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    const canManageTickets =
        user?.role === "Support Agent" ||
        user?.role === "Security Analyst" ||
        user?.role === "Admin";

    useEffect(() => {
        loadTickets();

        if (canManageTickets) {
            loadAssignableUsers();
        }
    }, []);

    const loadTickets = async () => {
        try {
            const data = await getTickets();
            if (Array.isArray(data)) {
                setTickets(data);
            } else {
                setTickets(data.tickets || []);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAssignableUsers = async () => {
        try {
            const data = await getAssignableUsers();
            setUsers(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const loadTicketComments = async (ticketId) => {
        try {
            const data = await getComments(ticketId);
            setComments({ ...comments, [ticketId]: data });
        } catch (error) {
            setError(error.message);
        }
    };

    const loadAttachmentsData = async (ticketId) => {
        try {
            const data = await getAttachments(ticketId);
            setAttachments({ ...attachments, [ticketId]: data });
        } catch (error) {
            setError(error.message);
        }
    };

    const loadIncidentTimeline = async (incidentId, ticketId) => {
        try {
            const data = await getIncidentTimeline(incidentId);
            setTimelines({ ...timelines, [ticketId]: data.timeline });
        } catch (error) {
            setError(error.message);
        }
    };

    const toggleTab = (ticketId, tab, incidentId) => {
        if (activeTab[ticketId] === tab) {
            setActiveTab({ ...activeTab, [ticketId]: null });
            return;
        }
        
        setActiveTab({ ...activeTab, [ticketId]: tab });
        
        if (tab === "comments") loadTicketComments(ticketId);
        if (tab === "timeline") loadIncidentTimeline(incidentId, ticketId);
        if (tab === "attachments") loadAttachmentsData(ticketId);
    };

    const handleUserChange = (ticketId, userId) => {
        setSelectedUsers({ ...selectedUsers, [ticketId]: userId });
    };

    const handleStatusChange = (ticketId, status) => {
        setSelectedStatuses({ ...selectedStatuses, [ticketId]: status });
    };

    const handleResolutionChange = (ticketId, resolution) => {
        setResolutions({ ...resolutions, [ticketId]: resolution });
    };

    const handleCommentChange = (ticketId, text) => {
        setNewComments({ ...newComments, [ticketId]: text });
    };

    const handleFileChange = (ticketId, file) => {
        setSelectedFiles({ ...selectedFiles, [ticketId]: file });
    };

    const handleAssign = async (ticketId) => {
        const userId = selectedUsers[ticketId];
        if (!userId) {
            setError("Please select a user first");
            return;
        }
        try {
            setError(""); setMessage("");
            await assignTicket(ticketId, userId);
            setMessage("Ticket assigned successfully");
            await loadTickets();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleStatusUpdate = async (ticketId) => {
        const status = selectedStatuses[ticketId];
        if (!status) {
            setError("Please select a status first");
            return;
        }
        try {
            setError(""); setMessage("");
            await updateTicketStatus(ticketId, status);
            setMessage("Ticket status updated successfully");
            await loadTickets();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleResolve = async (ticketId) => {
        const resolution = resolutions[ticketId];
        if (!resolution) {
            setError("Please enter a resolution first");
            return;
        }
        try {
            setError(""); setMessage("");
            await resolveTicket(ticketId, resolution);
            setMessage("Ticket resolved successfully");
            await loadTickets();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCreateComment = async (ticketId) => {
        const text = newComments[ticketId];
        if (!text || !text.trim()) {
            setError("Please enter a comment");
            return;
        }
        try {
            setError(""); setMessage("");
            await createComment(ticketId, text);
            setNewComments({ ...newComments, [ticketId]: "" });
            await loadTicketComments(ticketId);
            setMessage("Comment added successfully");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUpload = async (ticketId) => {
        const file = selectedFiles[ticketId];
        if (!file) {
            setError("Please select a file first");
            return;
        }
        try {
            setError(""); setMessage("");
            await uploadAttachment(ticketId, file);
            setSelectedFiles({ ...selectedFiles, [ticketId]: null });
            await loadAttachmentsData(ticketId);
            setMessage("Attachment uploaded successfully");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="cyber-dashboard">
            <h1>Ticket Management</h1>
            <p className="text-muted">Manage cybersecurity incident tickets</p>

            {message && <p className="text-success mt-20">{message}</p>}
            {loading && <p className="mt-20">Loading tickets...</p>}
            {error && <p className="text-danger mt-20">{error}</p>}
            {!loading && !error && tickets.length === 0 && <p className="text-muted mt-20">No tickets found.</p>}

            <div className="ticket-list">
                {tickets.map((ticket) => (
                    <div key={ticket._id} className="ticket-card glass-panel">
                        <div className="ticket-header">
                            <div className="ticket-title-group">
                                <div className={`incident-dot ${ticket.priority === 'Critical' ? 'critical' : ''}`}></div>
                                <h3>{ticket.title}</h3>
                            </div>
                            <div className="ticket-badges">
                                <span className={`priority-badge priority-${ticket.priority?.toLowerCase()}`}>
                                    {ticket.priority}
                                </span>
                                <span className="status-badge">
                                    {ticket.status}
                                </span>
                            </div>
                        </div>

                        <div className="ticket-meta">
                            <span><strong>Assigned:</strong> {ticket.assignedTo ? ticket.assignedTo.name : "Not assigned"}</span>
                            <span><strong>SLA Deadline:</strong> {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : "Not set"}</span>
                        </div>
                        
                        <div className="ticket-tabs">
                            <button
                                className={`cyber-button tab-button ${activeTab[ticket._id] === 'comments' ? 'active' : ''}`}
                                onClick={() => toggleTab(ticket._id, 'comments', ticket.incident?._id)}
                            >
                                Comments
                            </button>
                            <button
                                className={`cyber-button tab-button ${activeTab[ticket._id] === 'timeline' ? 'active' : ''}`}
                                onClick={() => toggleTab(ticket._id, 'timeline', ticket.incident?._id)}
                            >
                                Timeline
                            </button>
                            <button
                                className={`cyber-button tab-button ${activeTab[ticket._id] === 'attachments' ? 'active' : ''}`}
                                onClick={() => toggleTab(ticket._id, 'attachments', ticket.incident?._id)}
                            >
                                Attachments
                            </button>
                        </div>

                        {activeTab[ticket._id] === 'comments' && (
                            <div className="inner-panel mt-20">
                                <h4>Comments</h4>
                                {(!comments[ticket._id] || comments[ticket._id].length === 0) && (
                                    <p className="text-muted">No comments yet.</p>
                                )}
                                {comments[ticket._id]?.map((comment) => (
                                    <div key={comment._id} className="ticket-divider">
                                        <strong>{comment.user?.name || "User"}</strong>
                                        <p>{comment.message}</p>
                                        <small className="text-muted">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </small>
                                    </div>
                                ))}

                                {canManageTickets && (
                                    <div className="comment-form mt-20">
                                        <input
                                            type="text"
                                            placeholder="Write a comment"
                                            value={newComments[ticket._id] || ""}
                                            onChange={(e) => handleCommentChange(ticket._id, e.target.value)}
                                            className="cyber-input flex-grow"
                                        />
                                        <button
                                            onClick={() => handleCreateComment(ticket._id)}
                                            className="cyber-button primary ml-15"
                                        >
                                            Add Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab[ticket._id] === 'timeline' && (
                            <div className="inner-panel mt-20">
                                <h4>Investigation Timeline</h4>
                                {(!timelines[ticket._id] || timelines[ticket._id].length === 0) ? (
                                    <p className="text-muted">No activity found.</p>
                                ) : (
                                    timelines[ticket._id].map((log) => (
                                        <div key={log._id} className="ticket-divider">
                                            <strong>{log.action}</strong>
                                            <p>{log.details}</p>
                                            <small className="text-muted">
                                                {log.user?.name || "System"} · {new Date(log.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab[ticket._id] === 'attachments' && (
                            <div className="inner-panel mt-20">
                                <h4>Attachments</h4>
                                {(!attachments[ticket._id] || attachments[ticket._id].length === 0) ? (
                                    <p className="text-muted">No attachments yet.</p>
                                ) : (
                                    attachments[ticket._id].map((attachment) => (
                                        <p key={attachment._id}>
                                            📎 {attachment.fileName}
                                        </p>
                                    ))
                                )}

                                {canManageTickets && (
                                    <div className="attachment-form mt-20">
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(ticket._id, e.target.files[0])}
                                            className="cyber-file-input"
                                        />
                                        <button
                                            onClick={() => handleUpload(ticket._id)}
                                            className="cyber-button primary ml-15"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {canManageTickets && (
                            <div className="management-section mt-25">
                                <h4>Management</h4>
                                <div className="management-grid">
                                    <div className="management-control">
                                        <select
                                            className="cyber-input"
                                            value={selectedUsers[ticket._id] || ""}
                                            onChange={(e) => handleUserChange(ticket._id, e.target.value)}
                                        >
                                            <option value="">Select user</option>
                                            {users.map((u) => (
                                                <option key={u._id} value={u._id}>{u.name} - {u.role}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleAssign(ticket._id)} className="cyber-button primary">
                                            Assign
                                        </button>
                                    </div>
                                    <div className="management-control">
                                        <select
                                            className="cyber-input"
                                            value={selectedStatuses[ticket._id] || ""}
                                            onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                        >
                                            <option value="">Select status</option>
                                            <option value="Open">Open</option>
                                            <option value="Assigned">Assigned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Escalated">Escalated</option>
                                        </select>
                                        <button onClick={() => handleStatusUpdate(ticket._id)} className="cyber-button">
                                            Update Status
                                        </button>
                                    </div>
                                    <div className="management-control">
                                        <input
                                            type="text"
                                            placeholder="Enter resolution"
                                            value={resolutions[ticket._id] || ""}
                                            onChange={(e) => handleResolutionChange(ticket._id, e.target.value)}
                                            className="cyber-input"
                                        />
                                        <button onClick={() => handleResolve(ticket._id)} className="cyber-button success">
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tickets;
