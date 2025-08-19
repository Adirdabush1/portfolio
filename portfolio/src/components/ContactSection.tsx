import React, { useState, FormEvent } from "react";
import Swal from "sweetalert2";
import PrivacyNotice13 from "./PrivacyNotice13"; // ייבוא הקומפוננטה
import "./ContactSection.css";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false); // נשתמש כדי לבדוק אם המשתמש נתן הסכמה

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!consent) {
      Swal.fire({
        icon: "warning",
        title: "Consent Required",
        text: "Please agree to the Privacy Policy before sending your message.",
        confirmButtonColor: "#ff9800",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://portfolio-backend-og9l.onrender.com/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        }
      );

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
        setConsent(false);
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
        {/* Form */}
        <form
          id="contact-form"
          className="form-horizontal"
          role="form"
          onSubmit={handleSubmit}
        >
          {/* ... inputs for name, email, message ... */}

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

        {/* Right side - contact info */}
        <div className="direct-contact-container">
          <ul className="contact-list">
            {/* ... address, phone, email ... */}
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

          {/* הוספת PrivacyNotice13 מתחת לקישורים */}
          <PrivacyNotice13 onConsentChange={setConsent} />

          <hr />
          <div className="copyright">
            &copy; ALL OF THE RIGHTS RESERVED
          </div>
        </div>
      </div>
    </section>
  );
}
