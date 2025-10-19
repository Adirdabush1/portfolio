import React from "react";
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
    icon: "fa-solid fa-layer-group",
    title: "ShadCN UI / Framer Motion",
    color: "#FF69B4",
    description: "Modern UI and animation design.",
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
];

const SkillsSection = () => {
  return (
    <section className="skills-section">
      <h2>My Skills</h2>
      <ul className="skills-list">
        {skills.map((skill, idx) => (
          <li key={idx} style={{ "--accent-color": skill.color } as React.CSSProperties}>
            <div className="icon">
              <i className={skill.icon}></i>
            </div>
            <div className="title">{skill.title}</div>
            <div className="descr">{skill.description}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SkillsSection;
