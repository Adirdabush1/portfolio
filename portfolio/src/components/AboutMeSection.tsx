import React from "react";
import ScrollVelocity from "./ScrollVelocity";
import "./AboutMeSection.css";

const texts = [
  {
    title: "About Me",
    content:
      "I'm Adir, a Full Stack developer passionate about creating interactive, nature-inspired experiences with attention to detail.",
  },
  {
    title: "The Beginning",
    content:
      "I started learning programming out of curiosity, and continued out of a passion for building systems that solve real problems.",
  },
  {
    title: "Today",
    content:
      "Today I build applications using React and Node.js, integrating AI capabilities into my projects.",
  },
  {
    title: "What's Next",
    content:
      "I aim to keep learning, growing, and contributing to open source and the community.",
  },
];

// הופך כל טקסט לתצוגת Scroll רציפה
const scrollStrings = texts.map(
  (item) => `${item.title}: ${item.content}`
);

const AboutMeSection = () => {
  return (
    <section className="about-me-wrapper">
      <ScrollVelocity
        texts={scrollStrings}
        velocity={50}
        className="scroll-velocity-text"
      />
    </section>
  );
};

export default AboutMeSection;
