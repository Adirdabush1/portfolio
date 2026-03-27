import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./SkillsSection.css";
const skills = [
    {
        icon: "fa-brands fa-html5",
        title: "HTML5",
        color: "#e34c26",
        description: "Semantic, accessible, and clean markup.",
    },
    {
        icon: "fa-brands fa-css3",
        title: "CSS3",
        color: "#264de4",
        description: "Responsive layouts and animations.",
    },
    {
        icon: "fa-brands fa-js",
        title: "JavaScript / TypeScript",
        color: "#f0db4f",
        description: "Strongly typed and dynamic web development.",
    },
    {
        icon: "fa-brands fa-react",
        title: "React / React Native",
        color: "#61dafb",
        description: "Reusable components, hooks, and mobile apps.",
    },
    {
        icon: "fa-solid fa-mobile",
        title: "Expo / Expo Router",
        color: "#A020F0",
        description: "Cross-platform mobile development.",
    },
    {
        icon: "fa-brands fa-node-js",
        title: "Node.js / Express / NestJS",
        color: "#68a063",
        description: "Backend services, APIs, and server-side logic.",
    },
    {
        icon: "fa-solid fa-database",
        title: "MongoDB / Mongoose",
        color: "#4DB33D",
        description: "NoSQL database modeling and queries.",
    },
    {
        icon: "fa-solid fa-key",
        title: "JWT / bcrypt",
        color: "#0F2027",
        description: "Authentication & authorization.",
    },
    {
        icon: "fa-solid fa-wifi",
        title: "Socket.io",
        color: "#f2711c",
        description: "Real-time WebSocket communication.",
    },
    {
        icon: "fa-brands fa-google",
        title: "Firebase",
        color: "#FFA000",
        description: "Authentication and Firestore database.",
    },
    {
        icon: "fa-solid fa-envelope",
        title: "Nodemailer",
        color: "#0072C6",
        description: "Email services in backend apps.",
    },
    {
        icon: "fa-brands fa-git-alt",
        title: "Git / GitHub",
        color: "#f34f29",
        description: "Version control and collaboration.",
    },
    {
        icon: "fa-solid fa-cubes",
        title: "Java (Algorithms)",
        color: "#5382a1",
        description: "Problem-solving and data structures.",
    },
    {
        icon: "fa-brands fa-docker",
        title: "Docker / Docker Compose",
        color: "#228ddfff",
        description: "Containerization and multi-container orchestration.",
    },
    {
        icon: "fa-brands fa-aws",
        title: "AWS",
        color: "#FF9900",
        description: "Cloud deployment, EC2, S3, and serverless functions.",
    },
    {
        icon: "fa-solid fa-network-wired",
        title: "Kubernetes",
        color: "#326ce5",
        description: "Container orchestration, scaling, and management.",
    },
    {
        icon: "fa-solid fa-s",
        title: "Swift",
        color: "#F05138",
        description: "Production iOS apps and SDK development.",
    },
    {
        icon: "fa-solid fa-mobile-screen",
        title: "SwiftUI",
        color: "#007AFF",
        description: "Modern declarative UI for iOS 15+.",
    },
    {
        icon: "fa-brands fa-bluetooth",
        title: "CoreBluetooth",
        color: "#0082FC",
        description: "BLE communication with hardware devices.",
    },
    {
        icon: "fa-solid fa-tower-broadcast",
        title: "CoreNFC",
        color: "#34C759",
        description: "NFC tag scanning for electrodes.",
    },
    {
        icon: "fa-solid fa-arrows-spin",
        title: "RxSwift / RxCocoa",
        color: "#B7178C",
        description: "Reactive programming for iOS.",
    },
    {
        icon: "fa-solid fa-sitemap",
        title: "MVVM",
        color: "#8E44AD",
        description: "Architecture & clean code patterns.",
    },
    {
        icon: "fa-solid fa-database",
        title: "PostgreSQL",
        color: "#336791",
        description: "Relational database design and queries.",
    },
];
const SkillsSection = () => {
    return (_jsxs("section", { className: "skills-section", children: [_jsx("h2", { children: "My Skills" }), _jsx("ul", { className: "skills-list", children: skills.map((skill, idx) => (_jsxs("li", { style: { "--accent-color": skill.color }, children: [_jsx("div", { className: "icon", children: _jsx("i", { className: skill.icon }) }), _jsx("div", { className: "title", children: skill.title }), _jsx("div", { className: "descr", children: skill.description })] }, idx))) })] }));
};
export default SkillsSection;
