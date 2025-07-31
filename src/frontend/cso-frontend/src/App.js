import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import Kanban from "./pages/Kanban";
import Mood from "./pages/Mood";
import Analytics from "./pages/Analytics";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/kanban"
                        element={
                            <ProtectedRoute>
                                <Kanban />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/mood"
                        element={
                            <ProtectedRoute>
                                <Mood />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/analytics"
                        element={
                            <AdminRoute>
                                <Analytics />
                            </AdminRoute>
                        }
                    />

                    <Route path="/logout" element={<Logout />} />

                    <Route path="*" element={<AuthGate />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

function AuthGate() {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
