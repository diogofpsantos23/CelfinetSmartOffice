import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import profileIcon from "../assets/profile.svg";
import logo from "../assets/logo.png";

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    return (
        <header className="app-header">
            <img src={logo} alt="Celfinet Smart Office" className="logo"/>
            <div className="spacer"/>
            {user && (
                <div className="profile-wrapper" ref={menuRef}>
                    <button
                        className="avatar-btn"
                        aria-haspopup="true"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        title={user.username}
                    >
                        <img
                            src={profileIcon}
                            alt={user.username}
                            className="avatar-img"
                        />
                    </button>

                    {open && (
                        <div className="profile-menu">
                            <div className="profile-name">@{user.username}</div>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
