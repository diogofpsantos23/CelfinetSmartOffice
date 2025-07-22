import React from "react";
import "../App.css";

function Footer() {
    return (
        <footer className="footer">
            © {new Date().getFullYear()} - Celfinet Summer Internship
        </footer>
    );
}

export default Footer;
