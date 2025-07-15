import React from "react";

export default function SVGImageMask({
  image,
  maskId,
  filterId,
  className,
}: {
  image: string;
  maskId: string;
  filterId: string;
  className?: string;
}) {
  return (
    <svg
      className={className || "svg-project-img"}
      width="1000"
      height="600"
      viewBox="0 0 1000 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="13"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <mask id={maskId}>
          <circle
            cx="50%"
            cy="50%"
            r="0"
            fill="white"
            className={`mask-circle ${maskId}`}
          />
        </mask>
      </defs>
      <image
        href={image}
        width="1000"
        height="600"
        mask={`url(#${maskId})`}
        style={{
          filter: "brightness(120%)",
          transform: "scale(1.05)",
        }}
      />
    </svg>
  );
}
