import { useEffect, useState } from "react";
import { getItems } from "../../../services/api";
import { DetailsTicket } from "../../../services/tickets/TicketService";
import { fetchSuperCosts } from "../../../services/conf/SuperCostService";
import Header from "../../frontoffice/Header";

export default function ItemCostReport() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        setLoading(true);

        const tickets = await getItems("Ticket", { range: "0-9999" });
        const superCosts = await fetchSuperCosts();

        const superCostMap = {};
        superCosts.forEach(row => {
            superCostMap[row.ticket_id] = Number(row.super_cost || 0);
        });

        const report = {};

        for (const ticket of tickets || []) {
            const details = await DetailsTicket(ticket.id);

            const elements = details.elements || [];
            const elementCount = elements.length || 1;

            const ticketCost = (details.costs || []).reduce(
                (sum, cost) => sum + Number(cost.totalCost || 0),
                0
            );

            const ticketSuperCost = superCostMap[ticket.id] || 0;

            const costPerItem = ticketCost / elementCount;
            const superCostPerItem = ticketSuperCost / elementCount;

            elements.forEach(element => {
                const item = element.itemtype;

                if (!report[item]) {
                    report[item] = {
                        item,
                        cost: 0,
                        superCost: 0
                    };
                }

                report[item].cost += costPerItem;
                report[item].superCost += superCostPerItem;
            });
        }

        setRows(Object.values(report));
        setLoading(false);
    };

    return (
        <div className="container py-4">
            <Header/>
            <h1 className="fw-bold mb-4">Rapport des coûts par Item</h1>

            {loading ? (
                <div>Chargement...</div>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Cost</th>
                            <th>Super cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.item}>
                                <td>{row.item}</td>
                                <td>{row.cost.toFixed(2)}</td>
                                <td>{row.superCost.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}