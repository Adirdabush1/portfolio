import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import "./GlassAudioPlayer.css";
export default function GlassAudioPlayer() {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio)
            return;
        const updateProgress = () => setProgress(audio.currentTime);
        const setMeta = () => setDuration(audio.duration);
        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setMeta);
        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setMeta);
        };
    }, []);
    const togglePlay = () => {
        if (!audioRef.current)
            return;
        if (isPlaying) {
            audioRef.current.pause();
        }
        else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    const onSeek = (e) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };
    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };
    return (_jsx("div", { className: "container container--inline", children: _jsxs("div", { className: "glass-container glass-container--rounded glass-container--large", children: [_jsx("div", { className: "glass-filter" }), _jsx("div", { className: "glass-overlay" }), _jsx("div", { className: "glass-specular" }), _jsx("div", { className: "glass-content glass-content--inline", children: _jsxs("div", { className: "player", children: [_jsxs("div", { className: "player__thumb", children: [_jsx("img", { className: "player__img", src: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?auto=format&fit=crop&w=400", alt: "Podcast cover" }), _jsxs("div", { className: "player__legend", children: [_jsx("h3", { className: "player__legend__title", children: "Podcast: About Me" }), _jsx("span", { className: "player__legend__sub-title", children: "by Adir Dabush" })] })] }), _jsx("div", { className: "player__controls", children: _jsx("div", { className: "player__controls__play", onClick: togglePlay, children: isPlaying ? (_jsx("svg", { viewBox: "0 0 320 512", width: "24", children: _jsx("path", { fill: "white", d: "M96 64C60.7 64 32 92.7 32 128v256c0 35.3 28.7 64 64 64s64-28.7 64-64V128c0-35.3-28.7-64-64-64zM224 64c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64s64-28.7 64-64V128c0-35.3-28.7-64-64-64z" }) })) : (_jsx("svg", { viewBox: "0 0 448 512", width: "24", children: _jsx("path", { fill: "white", d: "M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" }) })) }) })] }) }), _jsxs("div", { className: "glass-content", style: { flexDirection: "column", paddingTop: 0 }, children: [_jsx("input", { type: "range", min: 0, max: duration, value: progress, onChange: onSeek, className: "audio-range" }), _jsxs("div", { className: "time-display", children: [_jsx("span", { children: formatTime(progress) }), _jsx("span", { children: formatTime(duration) })] })] }), _jsx("audio", { ref: audioRef, src: "/podcast2.mp3", preload: "metadata" })] }) }));
}
