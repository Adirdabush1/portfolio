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
        const updateProgress = () => {
            setProgress(audio.currentTime);
        };
        const setAudioDuration = () => {
            setDuration(audio.duration);
        };
        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setAudioDuration);
        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
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
        if (!audioRef.current)
            return;
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setProgress(time);
    };
    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };
    return (_jsx("div", { className: "container container--inline", children: _jsxs("div", { className: "glass-container glass-container--rounded glass-container--large", children: [_jsx("div", { className: "glass-filter" }), _jsx("div", { className: "glass-overlay" }), _jsx("div", { className: "glass-specular" }), _jsxs("div", { className: "glass-content", children: [_jsxs("div", { className: "player__thumb", children: [_jsx("img", { className: "player__img", src: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?auto=format&fit=crop&w=400", alt: "podcast" }), _jsxs("div", { className: "player__legend", children: [_jsx("h3", { className: "player__legend__title", children: "Meet the Developer&&Behind the Product" }), _jsx("span", { className: "player__legend__sub-title", children: "RateChat" })] })] }), _jsx("audio", { ref: audioRef, src: "/podcast2.mp3", preload: "metadata" }), _jsx("div", { className: "player__controls", children: _jsx("button", { className: "glass-play-button", onClick: togglePlay, children: isPlaying ? "⏸Pause" : "▶ Play" }) }), _jsx("input", { type: "range", min: 0, max: duration, value: progress, onChange: onSeek, className: "audio-range" }), _jsxs("div", { className: "time-display", children: [_jsx("span", { children: formatTime(progress) }), _jsx("span", { children: formatTime(duration) })] })] })] }) }));
}
