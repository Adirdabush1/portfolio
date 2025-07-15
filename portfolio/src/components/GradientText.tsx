import React, { ReactNode } from "react";
import "./GradientText.css";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#a155ff", "#40ffaa"],
  animationSpeed = 4,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div className={`animated-gradient-text ${className}`}>
      {/* לא מציגים יותר את ה-gradient-overlay */}
      <div className="text-content" style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}
