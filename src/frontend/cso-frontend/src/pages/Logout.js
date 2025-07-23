import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Logout() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            await logout();
            navigate("/login", { replace: true });
        })();
    }, [logout, navigate]);

    return null;
}
