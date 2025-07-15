import React from "react";
import "./useScrollAnimation.css";

export default function UseScrollAnimation() {
  const colors = [
    "#121212",
    "#1a1a1a",
    "#222222",
    "#2a2a2a",
    "#333333",
    "#3b3b3b",
  ];

  return (
    <div className="jelly-scroll">
      {colors.map((color, index) => (
        <div
          key={index}
          className="snap-section"
          style={{ backgroundColor: color }}
          aria-label={`Background color ${color}`}
          role="presentation"
        />
      ))}
    </div>
  );
}
