import { useState, useEffect, useRef } from "react";
import Avatar3D from "./Avatar3D";
import "./AiAssistant.css";

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://portfolio-backend-og9l.onrender.com";

export default function AiAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const recognitionRef = useRef<any>(null);

  const quickChips = [
    "What's your tech stack?",
    "Tell me about your experience",
    "What projects have you built?",
    "Why should I hire you?",
  ];

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(() => setServerReady(true))
      .catch(() => setServerReady(true));

    // Preload voices (Chrome loads them async)
    window.speechSynthesis?.getVoices();
    const onVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", onVoicesChanged);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", onVoicesChanged);
    };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = async (rawText: string) => {
    const text = rawText
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/`/g, "")
      .replace(/\n/g, ". ")
      .replace(/\s{2,}/g, " ")
      .replace(/\.{2,}/g, ".")
      .trim();

    setSpeaking(true);

    try {
      const res = await fetch(`${API_BASE}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setSpeaking(false);
      audio.play();
    } catch (err) {
      // Fallback to Web Speech API
      console.warn("ElevenLabs failed, falling back to Web Speech:", err);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.7;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) => v.name === "Daniel") ||
          voices.find((v) => v.lang.startsWith("en-US"));
        if (preferred) utterance.voice = preferred;
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        const duration = Math.max(text.length * 50, 2000);
        setTimeout(() => setSpeaking(false), duration);
      }
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  };

  // Unlock audio on iOS by speaking empty utterance on user tap
  const unlockAudio = () => {
    if (!window.speechSynthesis) return;
    const silence = new SpeechSynthesisUtterance("");
    silence.volume = 0;
    window.speechSynthesis.speak(silence);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    unlockAudio();
    setLoading(true);
    setAnswer("");
    stopSpeaking();

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setAnswer(data.text);
      setLoading(false);
      speakText(data.text);
    } catch (err) {
      if (err instanceof Error) {
        setAnswer("Error: " + err.message);
      } else {
        setAnswer("Unknown error");
      }
      setLoading(false);
    }
  };

  const askWithText = async (text: string) => {
    unlockAudio();
    setLoading(true);
    setAnswer("");
    stopSpeaking();

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setAnswer(data.text);
      setLoading(false);
      speakText(data.text);
    } catch (err) {
      setAnswer(err instanceof Error ? "Error: " + err.message : "Unknown error");
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!SpeechRecognitionAPI) {
      setAnswer("Speech recognition is not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        setListening(false);
        recognitionRef.current?.stop();
        askWithText(transcript);
      }
    };

    recognition.start();
  };

  const isTalking = loading || speaking;

  return (
    <section id="ai-assistant-section" className="ai-assistant-section">
      {/* 3D Avatar */}
      <div className="ai-avatar-wrapper">
        <Avatar3D talking={speaking} spokenText={answer} />
        <div className={`ai-status ${isTalking ? "active" : ""}`}>
          {listening ? "Listening..." : loading ? "Thinking..." : !serverReady ? "Waking up server..." : ""}
        </div>
      </div>

      {/* Speech Bubble for Answer */}
      {answer && (
        <div className="speech-bubble">
          {answer}
        </div>
      )}

      {/* Input Row */}
      <div className="ai-input-row">
        <input
          type="text"
          placeholder="Type or tap the mic to speak..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
          disabled={loading}
        />
        <button
          className={`ai-mic-btn ${listening ? "listening" : ""}`}
          onClick={toggleMic}
          disabled={loading}
          title="Voice input"
        >
          <i className={listening ? "fa-solid fa-stop" : "fa-solid fa-microphone"}></i>
        </button>
        {speaking ? (
          <button onClick={stopSpeaking} className="ai-stop-btn">
            <i className="fa-solid fa-stop"></i>
          </button>
        ) : (
          <button onClick={askAI} disabled={loading}>
            {loading ? "..." : "Ask"}
          </button>
        )}
      </div>

      {/* Small Suggestion Chips */}
      <div className="ai-chips">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            className="ai-chip"
            onClick={() => {
              setQuestion(chip);
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}
