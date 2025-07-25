import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Clock from "./Clock";
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

    const getUserName = () => {
        if (!user || !user.username) return "";
        const [first, last] = user.username.split(".");
        const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
        const firstName = capitalize(first);
        const lastName = capitalize(last);
        return `${firstName} ${lastName}`;
    }

    return (
        <header className="app-header">
            <img src={logo} alt="Celfinet Smart Office" className="logo"/>
            {user && (
                <div className="header-user">
                    <span className="header-user-name">Olá, {getUserName()}</span>
                    <div className="profile-wrapper" ref={menuRef}>
                        <Clock />
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
                </div>
            )}
        </header>
    );
}
