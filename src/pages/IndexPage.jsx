import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initSession } from "../services/api"; 

export default function IndexPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const initialize = async () => {
            try {
                const token = sessionStorage.getItem("glpi_session_token");

                if (!token) {
                    await initSession();
                }
                console.log("session : ",sessionStorage.getItem("glpi_session_token"))
                navigate("/myglpi/elements"); // URL de redirection
            } catch (err) {
                setError(
                    err?.message ||
                    "Une erreur est survenue lors de l'initialisation de la session."
                );
            }
        };

        initialize();
    }, [navigate]);

    return (
        <>
            {error && (
                <div className="container mt-5">
                    <div className="alert alert-danger">
                        {error}
                    </div>
                </div>
            )}
        </>
    );
}