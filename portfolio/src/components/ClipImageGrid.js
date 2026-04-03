import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './ClipImageGrid.css';
const IMAGES = [
    '/login ratechat.png',
    '/samurai1.png',
    '/samurai2.png',
    '/samurai3.png',
];
const CLIPS = [
    ['ellipse(0 0 at 0 0)', 'ellipse(150% 150% at 0 0)'],
    ['inset(100% 0 0 0)', 'inset(0 0 0 0)'],
    ['ellipse(0 0 at 100% 0)', 'ellipse(150% 150% at 100% 0)'],
    ['polygon(50% 50%,  50% 50%,  50% 50%, 50% 50%)', 'polygon(-50% 50%, 50% -50%, 150% 50%, 50% 150%)'],
];
const ClipImage = ({ src, start, end }) => {
    return (_jsxs("div", { className: "image", style: { '--clip-start': start, '--clip-end': end }, children: [_jsx("img", { src: src, alt: "" }), _jsx("img", { src: src, alt: "" })] }));
};
const ClipImageGrid = () => {
    return (_jsx("div", { className: "image-container", children: IMAGES.map((src, i) => (_jsx(ClipImage, { src: src, start: CLIPS[i][0], end: CLIPS[i][1] }, i))) }));
};
export default ClipImageGrid;
