import { useEffect, useRef, useState } from "react";

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

const GREETING = "Hey, I'm Adir.";
const SUBTITLE = "Welcome to my world";

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const hasCompleted = useRef(false);
  const [typedChars, setTypedChars] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect for greeting
  useEffect(() => {
    if (typedChars < GREETING.length) {
      const timeout = setTimeout(() => setTypedChars((c) => c + 1), 80);
      return () => clearTimeout(timeout);
    } else {
      // After greeting is done, show subtitle
      const timeout = setTimeout(() => setShowSubtitle(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [typedChars]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !hasCompleted.current) {
      hasCompleted.current = true;
      setTimeout(() => setFadeOut(true), 600);
      setTimeout(() => onComplete(), 1400);
    }
  }, [progress, onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0f0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 1s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Greeting with typewriter */}
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "clamp(1.8rem, 5vw, 3rem)",
          fontWeight: 300,
          letterSpacing: "0.02em",
          color: "#fff",
          marginBottom: 12,
          minHeight: "1.2em",
        }}
      >
        {GREETING.slice(0, typedChars)}
        <span
          style={{
            opacity: showCursor ? 1 : 0,
            color: "#4a90d9",
            fontWeight: 100,
            transition: "opacity 0.1s",
          }}
        >
          |
        </span>
      </div>

      {/* Subtitle fade in */}
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
          fontWeight: 300,
          letterSpacing: "0.15em",
          color: "rgba(176, 190, 197, 0.8)",
          marginBottom: 48,
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {SUBTITLE}
      </div>

      {/* Minimal line progress */}
      <div
        style={{
          width: "min(220px, 60vw)",
          height: 1,
          background: "rgba(74, 144, 217, 0.12)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #4a90d9, #efd09e)",
            transition: "width 0.3s ease",
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  );
}
