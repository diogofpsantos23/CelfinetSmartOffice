import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    if (loading) return null;
    if (user?.type !== "admin") return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
}

