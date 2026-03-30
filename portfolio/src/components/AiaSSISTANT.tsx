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
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  }, []);

  const playTTS = async (text: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) return;

      // Stream audio via MediaSource for faster playback start
      const mediaSource = new MediaSource();
      const url = URL.createObjectURL(mediaSource);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setSpeaking(false);

      mediaSource.addEventListener("sourceopen", async () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          const reader = res.body!.getReader();

          const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
              if (mediaSource.readyState === "open") mediaSource.endOfStream();
              return;
            }
            sourceBuffer.appendBuffer(value);
            await new Promise<void>((r) => {
              if (sourceBuffer.updating) {
                sourceBuffer.addEventListener("updateend", () => r(), { once: true });
              } else {
                r();
              }
            });
            await pump();
          };
          await pump();
        } catch {
          if (mediaSource.readyState === "open") mediaSource.endOfStream();
        }
      });

      await audio.play();
    } catch {
      // Fallback to non-streaming if MediaSource fails
      try {
        const res = await fetch(`${API_BASE}/api/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        audioRef.current = audio;
        audio.onplay = () => setSpeaking(true);
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(blobUrl); };
        audio.onerror = () => setSpeaking(false);
        await audio.play();
      } catch {
        setSpeaking(false);
      }
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setSpeaking(false);

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

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

      // Play TTS
      playTTS(data.text);
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
    setLoading(true);
    setAnswer("");
    setSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
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
      playTTS(data.text);
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
        <Avatar3D talking={isTalking} />
        <div className={`ai-status ${isTalking ? "active" : ""}`}>
          {listening ? "Listening..." : loading ? "Thinking..." : speaking ? "Speaking..." : !serverReady ? "Waking up server..." : "Ask me anything about Adir"}
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
        <button onClick={askAI} disabled={loading}>
          {loading ? "..." : "Ask"}
        </button>
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
