import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import "./Navbar.css";
export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        document.body.classList.toggle("menu-open", newState);
    };
    useEffect(() => {
        document.body.classList.toggle("menu-open", isOpen);
    }, [isOpen]);
    const handleLinkClick = (e) => {
        e.preventDefault();
        const href = e.currentTarget.getAttribute("href");
        if (href) {
            const el = document.querySelector(href);
            if (el)
                el.scrollIntoView({ behavior: "smooth" });
        }
        setIsOpen(false);
        document.body.classList.remove("menu-open");
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: `menu-btn ${isOpen ? "open" : ""}`, onClick: toggleMenu, "aria-label": isOpen ? "Close menu" : "Open menu", role: "button", tabIndex: 0, onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ")
                        toggleMenu();
                }, children: _jsx("i", { className: `fas ${isOpen ? "fa-times" : "fa-bars"}` }) }), _jsx("nav", { className: `wrapper ${isOpen ? "active" : ""}`, children: _jsxs("ul", { children: [_jsx("li", { children: _jsx("a", { href: "#home", onClick: handleLinkClick, children: "Home" }) }), _jsx("li", { children: _jsx("a", { href: "#projects", onClick: handleLinkClick, children: "Projects" }) }), _jsx("li", { children: _jsx("a", { href: "#about-me-section", onClick: handleLinkClick, children: "About Section" }) }), _jsx("li", { children: _jsx("a", { href: "#about-details", onClick: handleLinkClick, children: "About Me" }) }), _jsx("li", { children: _jsx("a", { href: "#ai-assistant", onClick: handleLinkClick, children: "AI Assistant" }) }), _jsx("li", { children: _jsx("a", { href: "#contact", onClick: handleLinkClick, children: "Contact" }) })] }) })] }));
}
