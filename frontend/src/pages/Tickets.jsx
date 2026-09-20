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
        <div className="dashboard">
            <h1>Ticket Management</h1>

            <p style={{ color: "#9ca3af" }}>
                Manage cybersecurity incident tickets
            </p>

            {message && (
                <p style={{ color: "#4ade80" }}>
                    {message}
                </p>
            )}

            {loading && <p>Loading tickets...</p>}

            {error && (
                <p style={{ color: "#f87171" }}>
                    {error}
                </p>
            )}

            {!loading && !error && tickets.length === 0 && (
                <p style={{ color: "#9ca3af" }}>
                    No tickets found.
                </p>
            )}

            <div style={{ marginTop: "30px" }}>
                {tickets.map((ticket) => (
                    <div
                        key={ticket._id}
                        className="incident-card"
                    >
                        <div>
                            <h3>{ticket.title}</h3>

                            <p>
                                Priority: {ticket.priority}
                            </p>

                            <p>
                                Status: {ticket.status}
                            </p>

                            <p>
                                Assigned To:{" "}
                                {ticket.assignedTo
                                    ? ticket.assignedTo.name
                                    : "Not assigned"}
                            </p>

                            <p>
                                SLA Deadline:{" "}
                                {ticket.slaDeadline
                                    ? new Date(
                                          ticket.slaDeadline
                                      ).toLocaleString()
                                    : "Not set"}
                            </p>

                            <div style={{ marginTop: "15px" }}>
                                <button
                                    onClick={() =>
                                        openComments[ticket._id]
                                            ? setOpenComments({
                                                  ...openComments,
                                                  [ticket._id]: false
                                              })
                                            : loadTicketComments(ticket._id)
                                    }
                                    style={{
                                        padding: "8px 14px",
                                        border: "none",
                                        borderRadius: "6px",
                                        background: "#6b21a8",
                                        color: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    {openComments[ticket._id]
                                        ? "Hide Comments"
                                        : "View Comments"}
                                </button>
                            </div>

                            {openComments[ticket._id] && (
                                <div
                                    style={{
                                        marginTop: "15px",
                                        padding: "15px",
                                        background: "#0f1117",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <h4>Comments</h4>

                                    {comments[ticket._id]?.length === 0 && (
                                        <p
                                            style={{
                                                color: "#9ca3af"
                                            }}
                                        >
                                            No comments yet.
                                        </p>
                                    )}

                                    {comments[ticket._id]?.map(
                                        (comment) => (
                                            <div
                                                key={comment._id}
                                                style={{
                                                    marginBottom: "12px",
                                                    paddingBottom: "10px",
                                                    borderBottom:
                                                        "1px solid #292d38"
                                                }}
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
                                                        color: "#6b7280"
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
                                                style={{
                                                    padding: "8px",
                                                    width: "70%",
                                                    borderRadius: "6px",
                                                    border:
                                                        "1px solid #343946",
                                                    background: "#171a23",
                                                    color: "white"
                                                }}
                                            />

                                            <button
                                                onClick={() =>
                                                    handleCreateComment(
                                                        ticket._id
                                                    )
                                                }
                                                style={{
                                                    marginLeft: "10px",
                                                    padding: "8px 14px",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    background: "#2563eb",
                                                    color: "white",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Add Comment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: "15px" }}>
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
                                    style={{
                                        padding: "8px 14px",
                                        border: "none",
                                        borderRadius: "6px",
                                        background: "#7c3aed",
                                        color: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    {openTimelines[ticket._id]
                                        ? "Hide Timeline"
                                        : "Investigation Timeline"}
                                </button>
                            </div>

                            {openTimelines[ticket._id] && (
                                <div
                                    style={{
                                        marginTop: "15px",
                                        padding: "15px",
                                        background: "#0f1117",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <h4>Investigation Timeline</h4>

                                    {timelines[ticket._id]?.length === 0 ? (
                                        <p style={{ color: "#9ca3af" }}>
                                            No activity found.
                                        </p>
                                    ) : (
                                        timelines[ticket._id]?.map((log) => (
                                            <div
                                                key={log._id}
                                                style={{
                                                    marginBottom: "12px",
                                                    paddingBottom: "10px",
                                                    borderBottom: "1px solid #292d38"
                                                }}
                                            >
                                                <strong>{log.action}</strong>

                                                <p>{log.details}</p>

                                                <small style={{ color: "#6b7280" }}>
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

                            <div style={{ marginTop: "15px" }}>
                                <h4>Attachments</h4>

                                <button
                                    onClick={() =>
                                        loadAttachments(ticket._id)
                                    }
                                    style={{
                                        padding: "8px 14px",
                                        border: "none",
                                        borderRadius: "6px",
                                        background: "#4b5563",
                                        color: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    View Attachments
                                </button>

                                {attachments[ticket._id] && (
                                    <div style={{ marginTop: "10px" }}>
                                        {attachments[ticket._id].length ===
                                        0 ? (
                                            <p
                                                style={{
                                                    color: "#9ca3af"
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
                                            style={{
                                                marginLeft: "10px",
                                                padding: "8px 14px",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: "#2563eb",
                                                color: "white",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                )}
                            </div>

                            {canManageTickets && (
                                <div style={{ marginTop: "15px" }}>
                                    <select
                                        value={
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
                                        style={{
                                            marginLeft: "10px",
                                            padding: "8px 14px",
                                            border: "none",
                                            borderRadius: "6px",
                                            background: "#2563eb",
                                            color: "white",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Assign
                                    </button>

                                    <div style={{ marginTop: "10px" }}>
                                        <select
                                            value={
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
                                            style={{
                                                marginLeft: "10px",
                                                padding: "8px 14px",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: "#374151",
                                                color: "white",
                                                cursor: "pointer"
                                            }}
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
                                            style={{
                                                padding: "8px",
                                                width: "300px",
                                                borderRadius: "6px",
                                                border:
                                                    "1px solid #343946",
                                                background: "#0f1117",
                                                color: "white"
                                            }}
                                        />

                                        <button
                                            onClick={() =>
                                                handleResolve(ticket._id)
                                            }
                                            style={{
                                                marginLeft: "10px",
                                                padding: "8px 14px",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: "#16a34a",
                                                color: "white",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <strong>
                                {ticket.priority}
                            </strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tickets;
