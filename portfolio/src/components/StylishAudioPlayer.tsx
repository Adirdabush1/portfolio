import React, { useRef, useState, useEffect } from "react";
import "./GlassAudioPlayer.css";

export default function GlassAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="container container--inline">
      <div className="glass-container glass-container--rounded glass-container--large">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content glass-content--inline">

          <div className="player">
            <div className="player__thumb">
              <img
                className="player__img"
                src="https://images.unsplash.com/photo-1619983081593-e2ba5b543168?auto=format&fit=crop&w=400"
                alt="Podcast cover"
              />
              <div className="player__legend">
                <h3 className="player__legend__title">Podcast: About Me</h3>
                <span className="player__legend__sub-title">by Adir Dabush</span>
              </div>
            </div>

            <div className="player__controls">
              <div className="player__controls__play" onClick={togglePlay}>
                {isPlaying ? (
                  <svg viewBox="0 0 320 512" width="24"><path fill="white" d="M96 64C60.7 64 32 92.7 32 128v256c0 35.3 28.7 64 64 64s64-28.7 64-64V128c0-35.3-28.7-64-64-64zM224 64c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64s64-28.7 64-64V128c0-35.3-28.7-64-64-64z"/></svg>
                ) : (
                  <svg viewBox="0 0 448 512" width="24"><path fill="white" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/></svg>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-content" style={{ flexDirection: "column", paddingTop: 0 }}>
          <input
            type="range"
            min={0}
            max={duration}
            value={progress}
            onChange={onSeek}
            className="audio-range"
          />
          <div className="time-display">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <audio ref={audioRef} src="/podcast2.mp3" preload="metadata" />
      </div>
    </div>
  );
}
