import React, { useEffect } from "react";
import "./AboutMe.css";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function AboutMe() {
  useEffect(() => {
  const st = new SplitText("p", { type: "chars", charsClass: "char" });

  st.chars.forEach((c) => {
    const char = c as HTMLElement;
    gsap.set(char, { attr: { "data-content": char.innerHTML } });
  });

  const textBlock = document.querySelector(".text-block") as HTMLElement;
  if (!textBlock) return;

  textBlock.onpointermove = (e: PointerEvent) => {
    st.chars.forEach((c) => {
      const char = c as HTMLElement;
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100)
        gsap.to(char, {
          overwrite: true,
          duration: 1.2 - dist / 100,
          scrambleText: {
            text: char.dataset.content ?? "",
            chars: ".:",
            speed: 0.5,
          },
          ease: "none",
        });
    });
  };
}, []);


  return (
    <section className="about-section">
      <h1 className="spotlight-heading" data-text="About Me">
        About Me
      </h1>

      <div className="text-block">
        <p>
          My journey began with a passion for building beautiful and intuitive
          experiences. Every project became an opportunity to grow, to
          experiment, and to improve. I’ve learned from challenges and
          transformed failures into milestones.
        </p>
        <p>
          Today, I combine visual creativity with smart functionality—bringing
          together intuition and strategy. The projects I build don’t just solve
          problems—they tell stories.
        </p>
      </div>
    </section>
  );
}
