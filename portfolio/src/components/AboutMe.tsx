import React, { useEffect, useRef } from "react";
import "./AboutMe.css";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function AboutMe() {
  const textBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textBlockRef.current) return;

    // Only split text inside .text-block, not all <p> tags on the page
    const st = new SplitText(textBlockRef.current.querySelectorAll("p"), {
      type: "chars",
      charsClass: "char",
    });

    st.chars.forEach((c) => {
      const char = c as HTMLElement;
      gsap.set(char, { attr: { "data-content": char.innerHTML } });
    });

    // Disable the expensive pointer effect on touch devices (mobile)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    let rafId: number | null = null;
    const handlePointerMove = (e: PointerEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
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
      });
    };

    textBlockRef.current.addEventListener("pointermove", handlePointerMove);
    const el = textBlockRef.current;
    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);


  return (
    <section className="about-section">
      <h1 className="spotlight-heading" data-text="About Me">
        About Me
      </h1>

      <div className="text-block" ref={textBlockRef}>
  <p>
    I'm a self-driven developer who doesn't wait for instructions to start building.
    Beyond my formal studies in full-stack development, I took it upon myself to master <strong>TypeScript</strong> and <strong>NestJS</strong>—learning them from scratch and applying them in real backend projects with real users.
  </p>
  <p>
    I designed and built structured APIs, implemented <strong>JWT authentication</strong>, and connected external <strong>LLM APIs</strong> to create intelligent systems—like a smart chat app that analyzes tone, filters content, and sends alerts automatically.
  </p>
  <p>
    For me, coding isn’t just about completing assignments—it's about solving real problems, staying curious, and building things that actually work. That mindset is what I bring to every team I join.
  </p>
</div>

    </section>
  );
}
