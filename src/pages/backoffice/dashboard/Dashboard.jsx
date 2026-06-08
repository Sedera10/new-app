import StatCard from "../../../assets/components/UI/StatCard"
import { getElementItems } from "../../../services/dashboard/DashboardService"

export default function Dashboard () {
    console.log("Session_token : ", sessionStorage.getItem("glpi_session_token"));
    return ( 
        <div className="container shadow-sm p-2">
            <h1 style={{ color : "var(--text-secondary)"}}>Dashboard</h1>
            <div className=" row my-3 shadow-sm d-flex flex-row justify-content-center align-items-center">
                <StatCard title={"Elements"} amount={10} footerText={"Nombre general des elements"}/>
                <StatCard title={"Tickets"} amount={2} footerText={"Nombre general des tickets"}/>
            </div>
            <div>
                <h2>Detrails par type</h2>
                <div className="row d-flex flex-row">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Element</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getElementItems.map(row => (
                                <tr key={row}>
                                    <td>row</td>
                                    <td>10</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
     )
}