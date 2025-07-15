import React from 'react';
import './ClipImageGrid.css';


const IMAGES: string[] = [
  '/login ratechat.png',
  '/samurai1.png',
  '/samurai2.png',
  '/samurai3.png',
];

const CLIPS: [string, string][] = [
  ['ellipse(0 0 at 0 0)', 'ellipse(150% 150% at 0 0)'],
  ['inset(100% 0 0 0)', 'inset(0 0 0 0)'],
  ['ellipse(0 0 at 100% 0)', 'ellipse(150% 150% at 100% 0)'],
  ['polygon(50% 50%,  50% 50%,  50% 50%, 50% 50%)', 'polygon(-50% 50%, 50% -50%, 150% 50%, 50% 150%)'],
];

type ClipImageProps = {
  src: string;
  start: string;
  end: string;
};

const ClipImage: React.FC<ClipImageProps> = ({ src, start, end }) => {
  return (
    <div className="image" style={{ '--clip-start': start, '--clip-end': end } as React.CSSProperties}>
      <img src={src} alt="" />
      <img src={src} alt="" />
    </div>
  );
};

const ClipImageGrid: React.FC = () => {
  return (
    <div className="image-container">
      {IMAGES.map((src, i) => (
        <ClipImage key={i} src={src} start={CLIPS[i][0]} end={CLIPS[i][1]} />
      ))}
    </div>
  );
};

export default ClipImageGrid;
