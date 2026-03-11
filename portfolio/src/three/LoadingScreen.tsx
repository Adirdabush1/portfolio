import React, { useEffect, useRef, useState } from "react";

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (progress >= 100 && !hasCompleted.current) {
      hasCompleted.current = true;
      // Small delay then fade out
      setTimeout(() => setFadeOut(true), 400);
      setTimeout(() => onComplete(), 1200);
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
        transition: "opacity 0.8s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      {/* Wireframe sphere animation via CSS */}
      <div
        style={{
          width: 120,
          height: 120,
          border: "1px solid rgba(74, 144, 217, 0.4)",
          borderRadius: "50%",
          animation: "spin3d 3s linear infinite",
          marginBottom: 40,
          boxShadow: "0 0 30px rgba(74, 144, 217, 0.15), inset 0 0 30px rgba(74, 144, 217, 0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 10,
            border: "1px solid rgba(74, 144, 217, 0.25)",
            borderRadius: "50%",
            animation: "spin3d 2s linear infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 25,
            border: "1px solid rgba(74, 144, 217, 0.15)",
            borderRadius: "50%",
            animation: "spin3d 4s linear infinite",
          }}
        />
      </div>

      <div
        style={{
          color: "#b0bec5",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "0.9rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        Loading Experience
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 200,
          height: 2,
          background: "rgba(74, 144, 217, 0.15)",
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

      <div
        style={{
          color: "#4a90d9",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "0.75rem",
          marginTop: 10,
          opacity: 0.7,
        }}
      >
        {Math.round(progress)}%
      </div>

      <style>{`
        @keyframes spin3d {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
