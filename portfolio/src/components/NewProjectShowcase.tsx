import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";
import "./NewProjectShowcase.css";
import SVGImageMask from "./SVGImageMask";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const projects = [
  {
    title: "CodeMode – Personal Project Showcase",
    link: "https://codemode.onrender.com",
    image: "/CodeMode.png", // ודא שהתמונה ב-public או בנתיב הנכון
    poetry: `A canvas for code, sleek and bright,\nWhere ideas flow and visions ignite,\nProjects come to life in digital light,\nCodeMode shines with creative might.`,
  },
  {
    title: "Samurai Knives Web Project",
    link: "https://github.com/Adirdabush1/samurai-knives-web",
    image: "/samurai1.png",
    poetry: `Shadows cast by the fading light,\nWhispers of steel, a sacred rite,\nHand-forged blades in crimson night,\nA warrior's grace, eternal fight.`,
  },
  {
    title: "RateChat – AI Chat Platform",
    link: "https://github.com/Adirdabush1/RateChat",
    image: "/login ratechat.png",
    poetry: `Voices rise in coded streams,\nWords are weighed in mindful beams,\nA child speaks safe, the system deems,\nRateChat guards their digital dreams.`,
  },
  {
    title: "TimesHub – Time Tracker",
    link: "https://github.com/Adirdabush1/TimesHub",
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
      </section>

      {projects.map((project, idx) => (
        <section className="project-section" key={idx}>
          <div className="project-text">
            <h2 className="project-title">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                {project.title}
              </a>
            </h2>
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
