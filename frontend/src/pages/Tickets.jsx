import { useEffect, useState } from "react";
import {
    getTickets,
    getAssignableUsers,
    assignTicket,
    updateTicketStatus
} from "../services/api";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});
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
