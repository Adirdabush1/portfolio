// Navbar.jsx
import { useState } from "react";
import "./Navbar.css"; // שים כאן את כל ה-CSS שהבאת

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* כפתור המבורגר */}
      <div className={`menu-btn ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
        <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
      </div>

      {/* תפריט overlay */}
      <div className={`wrapper ${isOpen ? "active" : ""}`}>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Gallery</a></li>
          <li><a href="#">Feedback</a></li>
        </ul>
      </div>
    </>
  );
}
