import { useEffect, useState } from "react";
import { getTickets } from "../services/api";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTickets();
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

    return (
        <div className="dashboard">
            <h1>Ticket Management</h1>

            <p style={{ color: "#9ca3af" }}>
                Manage cybersecurity incident tickets
            </p>

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
