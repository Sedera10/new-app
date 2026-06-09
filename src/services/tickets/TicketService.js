import { STATUS_MAP,PRIORITY_MAP } from "../imports/file2/helper";
import { getTicketTypeMap } from "../dashboard/DashboardService";
import { getItem, getItems } from "../api";

// fonction utiles
export const getStatusName = (id) => {
  return Object.keys(STATUS_MAP).find(
    key => STATUS_MAP[key] === Number(id)
  ) || null;
};
export const getPriorityName = (id) => {
  return Object.keys(PRIORITY_MAP).find(
    key => PRIORITY_MAP[key] === Number(id)
  ) || null;
};
export const getTypeName = (id) => {
    const TYPE_MAP = getTicketTypeMap()
  return Object.keys(TYPE_MAP).find(
    key => TYPE_MAP[key] === Number(id)
  ) || null;
};

export const DetailsTicket = async (idTicket) => {
    try {
        const [
            ticket,
            ticketUsers,
            logs,
            costs
        ] = await Promise.all([
            getItem('Ticket', idTicket),
            getItems(`Ticket/${idTicket}/Ticket_User`),
            getItems(`Ticket/${idTicket}/Log`),
            getItems(`Ticket/${idTicket}/TicketCost`)
        ]);
        // ==========================
        // Demandeur
        // ==========================
        const requesterLink = ticketUsers.find(
            user => Number(user.type) === 1
        );

        let requester = null;

        if (requesterLink?.users_id) {
            const user = await getItem('User', requesterLink.users_id);

            requester = {
                id: user.id,
                name: user.name
            };
        }
        // ==========================
        // Historique des statuts
        // ==========================
        const statusHistory = [
            {
                date: ticket.date,
                oldStatus: null,
                newStatus: 1,
                label: 'New'
            }
        ];
        const statusLogs = logs
            .filter(log =>
                log.id_search_option === 12 ||
                log.field === 'status'
            )
            .sort(
                (a, b) =>
                    new Date(a.date_mod) -
                    new Date(b.date_mod)
            );

        statusLogs.forEach(log => {
            statusHistory.push({
                date: log.date_mod,
                oldStatus: Number(log.old_value),
                newStatus: Number(log.new_value),
                label: getStatusName(log.new_value)
            });
        });

        const costAssociate = costs.map(cost => ({
            id: cost.id,
            name: cost.name,

            fixedCost: Number(cost.cost_fixed || 0),
            timeCost: Number(cost.cost_time || 0),
            materialCost: Number(cost.cost_material || 0),

            totalCost:
                Number(cost.cost_fixed || 0) +
                Number(cost.cost_time || 0) +
                Number(cost.cost_material || 0),

            durationMinutes:
                Math.round(Number(cost.actiontime || 0) / 60)
        }))

        return {
            info: {
                id: ticket.id,
                name: ticket.name,
                content: ticket.content,
                status: ticket.status,
                type: ticket.type,
                priority: ticket.priority,
                date: ticket.date
            },
            requester,
            statusHistory,
            costs: costAssociate
        };

    } catch (error) {
        console.error(error);
        throw error;
    }
};
