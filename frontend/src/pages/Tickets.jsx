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
    const [openComments, setOpenComments] = useState({});
    const [attachments, setAttachments] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [timelines, setTimelines] = useState({});
    const [openTimelines, setOpenTimelines] = useState({});
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

            setComments({
                ...comments,
                [ticketId]: data
            });

            setOpenComments({
                ...openComments,
                [ticketId]: true
            });
        } catch (error) {
            setError(error.message);
        }
    };

    const loadAttachments = async (ticketId) => {
        try {
            const data = await getAttachments(ticketId);

            setAttachments({
                ...attachments,
                [ticketId]: data
            });
        } catch (error) {
            setError(error.message);
        }
    };

    const loadIncidentTimeline = async (incidentId, ticketId) => {
        try {
            const data = await getIncidentTimeline(incidentId);

            setTimelines({
                ...timelines,
                [ticketId]: data.timeline
            });

            setOpenTimelines({
                ...openTimelines,
                [ticketId]: true
            });
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUserChange = (ticketId, userId) => {
        setSelectedUsers({
            ...selectedUsers,
            [ticketId]: userId
        });
    };

    const handleStatusChange = (ticketId, status) => {
        setSelectedStatuses({
            ...selectedStatuses,
            [ticketId]: status
        });
    };

    const handleResolutionChange = (ticketId, resolution) => {
        setResolutions({
            ...resolutions,
            [ticketId]: resolution
        });
    };

    const handleCommentChange = (ticketId, text) => {
        setNewComments({
            ...newComments,
            [ticketId]: text
        });
    };

    const handleFileChange = (ticketId, file) => {
        setSelectedFiles({
            ...selectedFiles,
            [ticketId]: file
        });
    };

    const handleAssign = async (ticketId) => {
        const userId = selectedUsers[ticketId];

        if (!userId) {
            setError("Please select a user first");
            return;
        }

        try {
            setError("");
            setMessage("");

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
            setError("");
            setMessage("");

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
            setError("");
            setMessage("");

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
            setError("");
            setMessage("");

            await createComment(ticketId, text);

            setNewComments({
                ...newComments,
                [ticketId]: ""
            });

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
            setError("");
            setMessage("");

            await uploadAttachment(ticketId, file);

            setSelectedFiles({
                ...selectedFiles,
                [ticketId]: null
            });

            await loadAttachments(ticketId);

            setMessage("Attachment uploaded successfully");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="cyber-dashboard">
            <h1>Ticket Management</h1>

            <p style={{ color: "var(--muted)" }}>
                Manage cybersecurity incident tickets
            </p>

            {message && (
                <p style={{ color: "var(--success)" }}>
                    {message}
                </p>
            )}

            {loading && <p>Loading tickets...</p>}

            {error && (
                <p style={{ color: "var(--danger)" }}>
                    {error}
                </p>
            )}

            {!loading && !error && tickets.length === 0 && (
                <p style={{ color: "var(--muted)" }}>
                    No tickets found.
                </p>
            )}

            <div style={{ marginTop: "30px" }}>
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
                        
                        <div className="ticket-actions">
                                <button
                                    onClick={() =>
                                        openComments[ticket._id]
                                            ? setOpenComments({
                                                  ...openComments,
                                                  [ticket._id]: false
                                              })
                                            : loadTicketComments(ticket._id)
                                    }
                                    className="cyber-button"
                                >
                                    {openComments[ticket._id]
                                        ? "Hide Comments"
                                        : "View Comments"}
                                </button>

                            {openComments[ticket._id] && (
                                <div
                                    className="inner-panel"
                                >
                                    <h4>Comments</h4>

                                    {comments[ticket._id]?.length === 0 && (
                                        <p
                                            style={{
                                                color: "var(--muted)"
                                            }}
                                        >
                                            No comments yet.
                                        </p>
                                    )}

                                    {comments[ticket._id]?.map(
                                        (comment) => (
                                            <div
                                                key={comment._id}
                                                className="ticket-divider"
                                            >
                                                <strong>
                                                    {comment.user?.name ||
                                                        "User"}
                                                </strong>

                                                <p>
                                                    {comment.message}
                                                </p>

                                                <small
                                                    style={{
                                                        color: "var(--muted)"
                                                    }}
                                                >
                                                    {new Date(
                                                        comment.createdAt
                                                    ).toLocaleString()}
                                                </small>
                                            </div>
                                        )
                                    )}

                                    {canManageTickets && (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Write a comment"
                                                value={
                                                    newComments[
                                                        ticket._id
                                                    ] || ""
                                                }
                                                onChange={(event) =>
                                                    handleCommentChange(
                                                        ticket._id,
                                                        event.target.value
                                                    )
                                                }
                                                className="cyber-input" style={{ width: "70%" }}
                                            />

                                            <button
                                                onClick={() =>
                                                    handleCreateComment(
                                                        ticket._id
                                                    )
                                                }
                                                className="cyber-button primary" style={{ marginLeft: "10px" }}
                                            >
                                                Add Comment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                                <button
                                    onClick={() =>
                                        openTimelines[ticket._id]
                                            ? setOpenTimelines({
                                                  ...openTimelines,
                                                  [ticket._id]: false
                                              })
                                            : loadIncidentTimeline(
                                                  ticket.incident?._id,
                                                  ticket._id
                                              )
                                    }
                                    className="cyber-button"
                                >
                                    {openTimelines[ticket._id]
                                        ? "Hide Timeline"
                                        : "Investigation Timeline"}
                                </button>

                            {openTimelines[ticket._id] && (
                                <div
                                    className="inner-panel"
                                >
                                    <h4>Investigation Timeline</h4>

                                    {timelines[ticket._id]?.length === 0 ? (
                                        <p style={{ color: "var(--muted)" }}>
                                            No activity found.
                                        </p>
                                    ) : (
                                        timelines[ticket._id]?.map((log) => (
                                            <div
                                                key={log._id}
                                                className="ticket-divider"
                                            >
                                                <strong>{log.action}</strong>

                                                <p>{log.details}</p>

                                                <small style={{ color: "var(--muted)" }}>
                                                    {log.user?.name || "System"} ·{" "}
                                                    {new Date(
                                                        log.createdAt
                                                    ).toLocaleString()}
                                                </small>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                                <button
                                    onClick={() =>
                                        loadAttachments(ticket._id)
                                    }
                                    className="cyber-button"
                                >
                                    View Attachments
                                </button>
                        </div>

                                {attachments[ticket._id] && (
                                    <div style={{ marginTop: "10px" }}>
                                        {attachments[ticket._id].length ===
                                        0 ? (
                                            <p
                                                style={{
                                                    color: "var(--muted)"
                                                }}
                                            >
                                                No attachments yet.
                                            </p>
                                        ) : (
                                            attachments[ticket._id].map(
                                                (attachment) => (
                                                    <p
                                                        key={
                                                            attachment._id
                                                        }
                                                    >
                                                        📎{" "}
                                                        {
                                                            attachment.fileName
                                                        }
                                                    </p>
                                                )
                                            )
                                        )}
                                    </div>
                                )}

                                {canManageTickets && (
                                    <div style={{ marginTop: "10px" }}>
                                        <input
                                            type="file"
                                            onChange={(event) =>
                                                handleFileChange(
                                                    ticket._id,
                                                    event.target.files[0]
                                                )
                                            }
                                        />

                                        <button
                                            onClick={() =>
                                                handleUpload(ticket._id)
                                            }
                                            className="cyber-button primary" style={{ marginLeft: "10px" }}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                )}

                            {canManageTickets && (
                                <div className="management-bar">
                                    <select className="cyber-input" value={
                                            selectedUsers[ticket._id] || ""
                                        }
                                        onChange={(event) =>
                                            handleUserChange(
                                                ticket._id,
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select user
                                        </option>

                                        {users.map((assignableUser) => (
                                            <option
                                                key={assignableUser._id}
                                                value={assignableUser._id}
                                            >
                                                {assignableUser.name} -{" "}
                                                {assignableUser.role}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() =>
                                            handleAssign(ticket._id)
                                        }
                                        className="cyber-button primary" style={{ marginLeft: "10px" }}
                                    >
                                        Assign
                                    </button>

                                    <div style={{ marginTop: "10px" }}>
                                        <select className="cyber-input" value={
                                                selectedStatuses[ticket._id] ||
                                                ""
                                            }
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    ticket._id,
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select status
                                            </option>

                                            <option value="Open">
                                                Open
                                            </option>

                                            <option value="Assigned">
                                                Assigned
                                            </option>

                                            <option value="In Progress">
                                                In Progress
                                            </option>

                                            <option value="Resolved">
                                                Resolved
                                            </option>

                                            <option value="Escalated">
                                                Escalated
                                            </option>
                                        </select>

                                        <button
                                            onClick={() =>
                                                handleStatusUpdate(
                                                    ticket._id
                                                )
                                            }
                                            className="cyber-button" style={{ marginLeft: "10px" }}
                                        >
                                            Update Status
                                        </button>
                                    </div>

                                    <div style={{ marginTop: "10px" }}>
                                        <input
                                            type="text"
                                            placeholder="Enter resolution"
                                            value={
                                                resolutions[ticket._id] || ""
                                            }
                                            onChange={(event) =>
                                                handleResolutionChange(
                                                    ticket._id,
                                                    event.target.value
                                                )
                                            }
                                            className="cyber-input" style={{ width: "300px" }}
                                        />

                                        <button
                                            onClick={() =>
                                                handleResolve(ticket._id)
                                            }
                                            className="cyber-button success" style={{ marginLeft: "10px" }}
                                        >
                                            Resolve
                                        </button>
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
