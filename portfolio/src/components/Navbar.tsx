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

  const handleLinkClick = () => {
    setIsOpen(false);
    document.body.classList.remove("menu-open"); // ביטול חסימת גלילה מידית
  };

  return (
    <>
      {/* כפתור המבורגר */}
      <div
        className={`menu-btn ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleMenu();
        }}
      >
        <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
      </div>

      {/* תפריט ניווט */}
      <nav className={`wrapper ${isOpen ? "active" : ""}`}>
        <ul>
          <li><a href="#home" onClick={handleLinkClick}>Home</a></li>
          <li><a href="#projects" onClick={handleLinkClick}>Projects</a></li>
          <li><a href="#about-me-section" onClick={handleLinkClick}>About Section</a></li>
          <li><a href="#about-details" onClick={handleLinkClick}>About Me</a></li>
          <li><a href="#ai-assistant" onClick={handleLinkClick}>AI Assistant</a></li>
          <li><a href="#contact" onClick={handleLinkClick}>Contact</a></li>
        </ul>
      </nav>
    </>
  );
}
