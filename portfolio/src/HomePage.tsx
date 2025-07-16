import React from "react";
import GradientText from "./components/GradientText";
import RotatingText from './components/RotatingText';
import Navbar from "./components/Navbar";
import GlassAudioPlayer from "./components/GlassAudioPlayer";
import AboutMeSection from "./components/AboutMeSection";
import AboutMe from "./components/AboutMe";
import UseScrollAnimation from "./useScrollAnimation";
import WantToSeeMore from "./components/WantToSeeMore";
import NewProjectShowcase from "./components/NewProjectShowcase";
import AiAssistant from "./components/AiaSSISTANT";
import ContactSection from "./components/ContactSection";
import "./HomePage.css";

export default function HomePage() {
  const rotatingTexts = [
    "Full Stack Developer",
    "React Enthusiast",
    "Open Source Contributor",
    "Lifelong Learner"
  ];

  return (
    <div id="projects-container" style={{ overflowX: "hidden" }}>
      <div className="homepage-container" id="home">
        <Navbar />
        <UseScrollAnimation />

        <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
          <filter id="tear" x="0" y="0" width="100%" height="100%">
            <feTurbulence baseFrequency=".03" numOctaves="3" />
            <feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G" />
            <feOffset dx="-4" dy="-4" />
            <feComposite in="SourceGraphic" operator="atop" />
          </filter>
        </svg>

        <div className="hero-content">
          <div className="hero">
            <GradientText
              className="hero-title-inline"
              animationSpeed={4}
              colors={["#ffffff", "#c0c0c0", "#7f8c8d", "#ffffff"]}
            >
              Hey I'm Adir
            </GradientText>

            <div className="hero-subtitle-filtered">
              <RotatingText texts={rotatingTexts} rotationInterval={3000} />
            </div>

            <WantToSeeMore />
          </div>

          <img
            src="/homepage.jpg"
            alt="My SVG"
            className="hero-image puff-in-hor"
          />
        </div>
      </div>

      <section id="about-me-section">
        <AboutMeSection />
      </section>

      <section id="audio-player">
        <GlassAudioPlayer />
      </section>

      <section id="about-details">
        <AboutMe />
      </section>

      <section id="projects">
        <NewProjectShowcase />
      </section>

      <section id="ai-assistant">
        <AiAssistant />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </div>
  );
}
