const Ticket = require("../models/Ticket");
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

            await createAuditLog({
                user: ticket.assignedTo || null,
                action: "Ticket Escalated",
                ticket: ticket._id,
                details: "Ticket escalated because SLA deadline was reached"
            });
        }

        if (tickets.length) {
            console.log(`${tickets.length} ticket(s) escalated`);
        }
    } catch (error) {
        console.error("SLA check failed:", error.message);
    }
};

module.exports = checkSlaEscalation;