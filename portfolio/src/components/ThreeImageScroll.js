import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "./ThreeImageScroll.css";
import { Navigation, Autoplay } from "swiper/modules";
const images = [
    {
        src: "/samurai1.png",
        alt: "a site for selling Japanese kniveis",
        title: "Samurai Knives Web Project",
        desc: `The Samurai Knives Web project is a dynamic React-based website showcasing handcrafted Japanese-style knives. The site offers a clean, natural, and modern design focused on providing an engaging user experience.

It features an interactive gallery with smooth animations for image transitions, allowing visitors to explore detailed information about each knife, including materials, manufacturing process, and history.

The codebase is modular and organized, leveraging React components and state management for dynamic content, with full responsiveness for mobile devices.
https://github.com/Adirdabush1/samurai-knives-web`,
    },
    {
        src: "/login ratechat.png",
        alt: "A chat app tailored for children with artificial intelligence ",
        title: "RateChat – Smart and Modern Communication Platform",
        desc: `RateChat is a real-time chat application designed for educational institutions and youth communities, combining a user-friendly interface with advanced AI technology. The platform analyzes message content, rates conversation quality, and ensures safe and respectful communication through automated alerts for inappropriate content.

Built with React and TypeScript on the frontend, and Node.js, Express, and MongoDB on the backend, RateChat leverages the OpenAI API for real-time AI-powered message analysis. The app features secure authentication using JWT and Bcrypt, with a fully responsive design optimized for mobile devices.

This project demonstrates the integration of modern web technologies with AI to create a scalable, secure, and socially impactful communication platform.
https://github.com/Adirdabush1/RateChat`,
    },
    {
        src: "/samurai2.png",
        alt: "a site for selling Japanese kniveis",
        title: "Samurai Knives Web Project",
        desc: `The Samurai Knives Web project is a dynamic React-based website showcasing handcrafted Japanese-style knives. The site offers a clean, natural, and modern design focused on providing an engaging user experience.

It features an interactive gallery with smooth animations for image transitions, allowing visitors to explore detailed information about each knife, including materials, manufacturing process, and history.

The codebase is modular and organized, leveraging React components and state management for dynamic content, with full responsiveness for mobile devices.
https://github.com/Adirdabush1/samurai-knives-web`,
    },
    {
        src: "/image.png",
        alt: "website for atricels",
        title: "TimesHub – Modern Full-Stack Time Management Solution",
        desc: `TimesHub is a full-stack application built with a focus on modern, secure, and efficient time management. Written primarily in TypeScript, the project offers a smooth and responsive user experience powered by a clean architecture dividing backend and frontend responsibilities.

The backend, developed with Node.js and Express, manages data and business logic securely. The frontend, built with React and TypeScript, provides an intuitive interface styled with CSS for seamless client-side interaction.

Depending on the environment or feature set, TimesHub utilizes either MongoDB or Firestore for data storage, ensuring flexibility and scalability.

This project showcases robust full-stack development combining modern technologies to deliver a professional-grade productivity tool.
https://github.com/Adirdabush1/TimesHub`,
    },
    {
        src: "/timeshub.png",
        alt: "website for atricels",
        title: "TimesHub – Modern Full-Stack Time Management Solution",
        desc: `TimesHub is a full-stack application built with a focus on modern, secure, and efficient time management. Written primarily in TypeScript, the project offers a smooth and responsive user experience powered by a clean architecture dividing backend and frontend responsibilities.

The backend, developed with Node.js and Express, manages data and business logic securely. The frontend, built with React and TypeScript, provides an intuitive interface styled with CSS for seamless client-side interaction.

Depending on the environment or feature set, TimesHub utilizes either MongoDB or Firestore for data storage, ensuring flexibility and scalability.

This project showcases robust full-stack development combining modern technologies to deliver a professional-grade productivity tool.
https://github.com/Adirdabush1/TimesHub`,
    },
];
export default function ThreeImageCarousel() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const swiperRef = useRef(null);
    function openModal(project) {
        var _a;
        setSelectedProject(project);
        setModalOpen(true);
        (_a = swiperRef.current) === null || _a === void 0 ? void 0 : _a.autoplay.stop();
    }
    function closeModal() {
        var _a;
        setModalOpen(false);
        setSelectedProject(null);
        (_a = swiperRef.current) === null || _a === void 0 ? void 0 : _a.autoplay.start();
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "swiper-container", onMouseEnter: () => { var _a; return (_a = swiperRef.current) === null || _a === void 0 ? void 0 : _a.autoplay.stop(); }, onMouseLeave: () => { var _a; return (_a = swiperRef.current) === null || _a === void 0 ? void 0 : _a.autoplay.start(); }, children: _jsx(Swiper, { onSwiper: (swiper) => (swiperRef.current = swiper), modules: [Navigation, Autoplay], slidesPerView: 3, spaceBetween: 170, navigation: true, autoplay: { delay: 1450, disableOnInteraction: false }, loop: true, breakpoints: {
                        0: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }, children: images.map((img, index) => (_jsx(SwiperSlide, { children: _jsxs("div", { className: "carousel-item", onClick: () => openModal(img), role: "button", tabIndex: 0, onKeyDown: (e) => {
                                if (e.key === "Enter")
                                    openModal(img);
                            }, children: [_jsx("img", { src: img.src, alt: img.alt }), _jsx("p", { children: img.alt })] }) }, index))) }) }), modalOpen && selectedProject && (_jsx("div", { className: "modal-overlay", onClick: closeModal, role: "dialog", "aria-modal": "true", "aria-labelledby": "modalTitle", "aria-describedby": "modalDesc", children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), style: { backgroundImage: `url(${selectedProject.src})` }, children: [_jsx("button", { className: "modal-close", onClick: closeModal, "aria-label": "Close modal", children: "\u00D7" }), _jsx("h2", { id: "modalTitle", children: selectedProject.title }), _jsx("p", { id: "modalDesc", children: selectedProject.desc })] }) }))] }));
}
