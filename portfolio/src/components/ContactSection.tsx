import React, { useState, FormEvent } from "react";
import Swal from "sweetalert2";
import "./ContactSection.css";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://portfolio-backend-og9l.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Message Sent",
          text: "Thanks for reaching out! I’ll get back to you soon.",
          confirmButtonColor: "#007bff",
        });

        setName("");
        setEmail("");
        setMessage("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Sending Failed",
          text: "Something went wrong. Please try again later.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not send message. Please check your connection.",
        confirmButtonColor: "#d33",
      });
      console.error(error);
    }
  };

  return (
    <section id="contact">
      <h1 className="section-header">Contact</h1>

      <div className="contact-wrapper">
        {/* טופס */}
        <form
          id="contact-form"
          className="form-horizontal"
          role="form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <div className="col-sm-12">
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="NAME"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-12">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="EMAIL"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <textarea
            className="form-control"
            rows={10}
            placeholder="MESSAGE"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button
            className="btn btn-primary send-button"
            id="submit"
            type="submit"
            value="SEND"
          >
            <div className="alt-send-button">
              <i className="fas fa-paper-plane"></i>
              <span className="send-text">SEND</span>
            </div>
          </button>
        </form>

        {/* צד ימין - פרטי קשר */}
        <div className="direct-contact-container">
          <ul className="contact-list">
            <li className="list-item">
              <i className="fas fa-map-marker-alt fa-2x">
                <span className="contact-text place">Herzliya, Israel</span>
              </i>
            </li>

            <li className="list-item">
              <i className="fas fa-phone fa-2x">
                <span className="contact-text phone">
                  <a href="tel:+972548265460" title="Give me a call">
                    (+972) 054-826-5460
                  </a>
                </span>
              </i>
            </li>

            <li className="list-item">
              <i className="fas fa-envelope fa-2x">
                <span className="contact-text gmail">
                  <a href="mailto:adiraws2025@gmail.com" title="Send me an email">
                    adiraws2025@gmail.com
                  </a>
                </span>
              </i>
            </li>
          </ul>

          <hr />
          <ul className="social-media-list">
            <li>
              <a
                href="https://github.com/Adirdabush1"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-icon"
              >
                <i className="fab fa-github" aria-hidden="true"></i>
              </a>
            </li>

            <li>
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-icon"
              >
                <i className="fab fa-linkedin" aria-hidden="true"></i>
              </a>
            </li>
          </ul>
          <hr />

          <div className="copyright">
            &copy; ALL OF THE RIGHTS RESERVED
          </div>
        </div>
      </div>
    </section>
  );
}
