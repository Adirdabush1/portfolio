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
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="container container--inline">
      <div className="glass-container glass-container--rounded glass-container--large">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>

        <div className="glass-content">
          <div className="player__thumb">
            <img
              className="player__img"
              src="https://images.unsplash.com/photo-1619983081593-e2ba5b543168?auto=format&fit=crop&w=400"
              alt="podcast"
            />
            <div className="player__legend">
              <h3 className="player__legend__title">Meet the Developer&&Behind the Product</h3>
              <span className="player__legend__sub-title">RateChat</span>
            </div>
          </div>

          <audio ref={audioRef} src="/podcast2.mp3" preload="metadata" />

          <div className="player__controls">
            <button className="glass-play-button" onClick={togglePlay}>
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
          </div>

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
      </div>
    </div>
  );
}
