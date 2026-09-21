const Ticket = require("../models/Ticket");
const Incident = require("../models/Incident");
const { createAuditLog } = require("../controllers/auditController");

const checkSlaEscalation = async () => {
    try {
        const tickets = await Ticket.find({
            status: { $nin: ["Resolved", "Escalated"] },
            slaDeadline: { $lte: new Date() }
        });

        for (const ticket of tickets) {
            ticket.status = "Escalated";
            await ticket.save();

            await Incident.findByIdAndUpdate(ticket.incident, {
                status: "Escalated"
            });

            await createAuditLog({
                user: null,
                action: "Ticket Escalated",
                ticket: ticket._id,
                incident: ticket.incident,
                details: "Ticket escalated because SLA deadline was reached"
            });
        }

        if (tickets.length)
            console.log(`${tickets.length} ticket(s) escalated`);
    } catch (error) {
        console.error("SLA check failed:", error.message);
    }
};

module.exports = checkSlaEscalation;