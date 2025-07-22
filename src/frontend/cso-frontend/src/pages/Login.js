// src/pages/Login.js
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (error) setError("");
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(form.username, form.password);
            navigate("/dashboard");
        } catch (err) {
            setError("Credenciais inválidas");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={onSubmit}>
                <h2>Entrar</h2>

                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={onChange}
                    autoComplete="username"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" disabled={submitting}>
                    {submitting ? "A entrar..." : "Login"}
                </button>
            </form>
        </div>
    );
}
