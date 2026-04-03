var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Swal from "sweetalert2";
import "./ContactSection.css";
export default function ContactSection() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        try {
            const response = yield fetch("https://portfolio-backend-og9l.onrender.com/api/contact", {
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
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Sending Failed",
                    text: "Something went wrong. Please try again later.",
                    confirmButtonColor: "#d33",
                });
            }
        }
        catch (error) {
            Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Could not send message. Please check your connection.",
                confirmButtonColor: "#d33",
            });
            console.error(error);
        }
    });
    return (_jsxs("section", { id: "contact", children: [_jsx("h1", { className: "section-header", children: "Contact" }), _jsxs("div", { className: "contact-wrapper", children: [_jsxs("form", { id: "contact-form", className: "form-horizontal", role: "form", onSubmit: handleSubmit, children: [_jsx("div", { className: "form-group", children: _jsx("div", { className: "col-sm-12", children: _jsx("input", { type: "text", className: "form-control", id: "name", placeholder: "NAME", name: "name", value: name, onChange: (e) => setName(e.target.value), required: true }) }) }), _jsx("div", { className: "form-group", children: _jsx("div", { className: "col-sm-12", children: _jsx("input", { type: "email", className: "form-control", id: "email", placeholder: "EMAIL", name: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true }) }) }), _jsx("textarea", { className: "form-control", rows: 10, placeholder: "MESSAGE", name: "message", value: message, onChange: (e) => setMessage(e.target.value), required: true }), _jsx("button", { className: "btn btn-primary send-button", id: "submit", type: "submit", value: "SEND", children: _jsxs("div", { className: "alt-send-button", children: [_jsx("i", { className: "fas fa-paper-plane" }), _jsx("span", { className: "send-text", children: "SEND" })] }) })] }), _jsxs("div", { className: "direct-contact-container", children: [_jsxs("ul", { className: "contact-list", children: [_jsx("li", { className: "list-item", children: _jsx("i", { className: "fas fa-map-marker-alt fa-2x", children: _jsx("span", { className: "contact-text place", children: "Herzliya, Israel" }) }) }), _jsx("li", { className: "list-item", children: _jsx("i", { className: "fas fa-phone fa-2x", children: _jsx("span", { className: "contact-text phone", children: _jsx("a", { href: "tel:+972548265460", title: "Give me a call", children: "(+972) 054-826-5460" }) }) }) }), _jsx("li", { className: "list-item", children: _jsx("i", { className: "fas fa-envelope fa-2x", children: _jsx("span", { className: "contact-text gmail", children: _jsx("a", { href: "mailto:adiraws2025@gmail.com", title: "Send me an email", children: "adiraws2025@gmail.com" }) }) }) })] }), _jsx("hr", {}), _jsxs("ul", { className: "social-media-list", children: [_jsx("li", { children: _jsx("a", { href: "https://github.com/Adirdabush1", target: "_blank", rel: "noopener noreferrer", className: "contact-icon", children: _jsx("i", { className: "fab fa-github", "aria-hidden": "true" }) }) }), _jsx("li", { children: _jsx("a", { href: "https://il.linkedin.com/in/adir-dabush-11a97b2b9", target: "_blank", rel: "noopener noreferrer", className: "contact-icon", children: _jsx("i", { className: "fab fa-linkedin", "aria-hidden": "true" }) }) })] }), _jsx("hr", {}), _jsx("div", { className: "copyright", children: "\u00A9 ALL OF THE RIGHTS RESERVED" })] })] })] }));
}
