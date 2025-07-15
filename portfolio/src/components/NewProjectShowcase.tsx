import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";
import "./NewProjectShowcase.css";
import SVGImageMask from "./SVGImageMask";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const projects = [
  {
    title: "Samurai Knives Web Project",
    image: "/samurai1.png",
    poetry: `Shadows cast by the fading light,\nWhispers of steel, a sacred rite,\nHand-forged blades in crimson night,\nA warrior's grace, eternal fight.`,
  },
  {
    title: "RateChat – AI Chat Platform",
    image: "/login ratechat.png",
    poetry: `Voices rise in coded streams,\nWords are weighed in mindful beams,\nA child speaks safe, the system deems,\nRateChat guards their digital dreams.`,
  },
  {
    title: "Samurai Knives Gallery",
    image: "/samurai2.png",
    poetry: `The blade reflects a thousand years,\nIn silence speaks the smith's own tears,\nDisplayed with pride, the soul appears,\nA scroll of steel through time reveres.`,
  },
  {
    title: "TimesHub – Time Tracker",
    image: "/timeshub.png",
    poetry: `Each moment counts, no time to hide,\nA hub where ticking thoughts reside,\nTypeScript binds the future wide,\nTimesHub leads where goals abide.`,
  },
];

export default function NewProjectShowcase() {
  useEffect(() => {
    ScrollSmoother.create({
      content: "#projects-container",
      smooth: 1.2,
      effects: true,
    });

    // אפקט הגדלת רדיוס המעגל
    gsap.utils.toArray<SVGCircleElement>(".mask-circle").forEach((circle) => {
      gsap.to(circle, {
        scrollTrigger: {
          trigger: circle.closest(".project-section")!,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
        attr: { r: 1000 },
      });
    });
  }, []);

  return (
    <div id="projects-container" className="project-showcase">
      <section className="intro-section">
        <h1 className="intro-title">Explore My Projects</h1>
        <p className="intro-sub">Scroll down to see more</p>
      </section>

      {projects.map((project, idx) => (
        <section className="project-section" key={idx}>
          <div className="project-text">
            <h2 className="project-title">{project.title}</h2>
            <p className="project-description">{project.poetry}</p>
          </div>
          <div className="project-image-wrapper">
            <SVGImageMask
              image={project.image}
              maskId={`mask${idx}`}
              filterId={`filter${idx}`}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
