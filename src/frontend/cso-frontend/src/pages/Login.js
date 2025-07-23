import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo2.png";
import "../styles/Auth.css";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState("");
    const [loading,  setLoading]  = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (_) {
            setError("Credenciais inválidas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="auth-logo">
                    <img src={logo} alt="Smart Office" className="logo-icon" />
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-box">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        {error && <p className="auth-error">{error}</p>}
                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? "A entrar..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
