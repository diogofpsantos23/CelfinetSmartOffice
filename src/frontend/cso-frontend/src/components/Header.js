import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Clock from "./Clock";
import profileIcon from "../assets/profile.svg";
import logo from "../assets/logo.png";

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [openProfile, setOpenProfile] = useState(false);
    const menuRef = useRef(null);
    const profileRef = useRef(null);
    const headerRef = useRef(null);
    const lastScrollY = useRef(window.scrollY);
    const ticking = useRef(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const toggleProfile = useCallback(() => setOpenProfile((v) => !v), []);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setOpenProfile(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target)) {

            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
        const updateHeaderVisibility = () => {
            const currentScrollY = window.scrollY;
            if (!headerRef.current) {
                ticking.current = false;
                lastScrollY.current = currentScrollY;
                return;
            }

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                headerRef.current.classList.add("header--hidden");
            } else {
                headerRef.current.classList.remove("header--hidden");
            }
            lastScrollY.current = currentScrollY;
            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(updateHeaderVisibility);
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const getUserName = () => {
        if (!user || !user.username) return "";
        const [first, last] = user.username.split(".");
        const capitalize = (str) =>
            str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
        const firstName = capitalize(first);
        const lastName = capitalize(last);
        return `${firstName} ${lastName}`;
    };

    const navItems = [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/kanban", label: "Kanban Board" }
    ];

    return (
        <>
            <header ref={headerRef} className="app-header">
                <div className="header-left">
                    <NavLink to="/" className="logo-link">
                        <img src={logo} alt="Celfinet Smart Office" className="logo" />
                    </NavLink>
                </div>

                <nav className="header-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className="nav-link"
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="header-user" ref={profileRef}>
                    {user && (
                        <>
                            <span className="header-user-name">
                                Olá, {getUserName()}
                            </span>
                            <Clock />
                            <button
                                className="avatar-btn"
                                aria-haspopup="true"
                                aria-expanded={openProfile}
                                onClick={toggleProfile}
                                title={user.username}
                            >
                                <img
                                    src={profileIcon}
                                    alt={user.username}
                                    className="avatar-img"
                                />
                            </button>

                            {openProfile && (
                                <div className="profile-menu">
                                    <div className="profile-name">
                                        @{user.username}
                                    </div>
                                    <button
                                        className="logout-btn"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </header>
        </>
    );
}
