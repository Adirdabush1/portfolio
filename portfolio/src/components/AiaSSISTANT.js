var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import Avatar3D from "./Avatar3D";
import "./AiAssistant.css";
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    const recognitionRef = useRef(null);
    const quickChips = [
        "What's your tech stack?",
        "Tell me about your experience",
        "What projects have you built?",
        "Why should I hire you?",
    ];
    useEffect(() => {
        var _a, _b, _c;
        fetch(`${API_BASE}/api/health`)
            .then(() => setServerReady(true))
            .catch(() => setServerReady(true));
        // Preload voices (Chrome loads them async)
        (_a = window.speechSynthesis) === null || _a === void 0 ? void 0 : _a.getVoices();
        const onVoicesChanged = () => window.speechSynthesis.getVoices();
        (_c = (_b = window.speechSynthesis) === null || _b === void 0 ? void 0 : _b.addEventListener) === null || _c === void 0 ? void 0 : _c.call(_b, "voiceschanged", onVoicesChanged);
        return () => {
            var _a, _b;
            (_b = (_a = window.speechSynthesis) === null || _a === void 0 ? void 0 : _a.removeEventListener) === null || _b === void 0 ? void 0 : _b.call(_a, "voiceschanged", onVoicesChanged);
        };
    }, []);
    const audioRef = useRef(null);
    const speakText = (rawText) => __awaiter(this, void 0, void 0, function* () {
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
            const res = yield fetch(`${API_BASE}/api/tts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            if (!res.ok)
                throw new Error("TTS failed");
            const blob = yield res.blob();
            const url = URL.createObjectURL(blob);
            // Reuse or create audio element (mobile requires user-gesture-initiated element)
            if (!audioRef.current) {
                audioRef.current = new Audio();
            }
            const audio = audioRef.current;
            audio.src = url;
            audio.onended = () => {
                setSpeaking(false);
                URL.revokeObjectURL(url);
            };
            audio.onerror = () => {
                setSpeaking(false);
                URL.revokeObjectURL(url);
            };
            yield audio.play();
        }
        catch (err) {
            // Fallback to Web Speech API
            console.warn("ElevenLabs failed, falling back to Web Speech:", err);
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.95;
                utterance.pitch = 0.7;
                const voices = window.speechSynthesis.getVoices();
                const preferred = voices.find((v) => v.name === "Daniel") ||
                    voices.find((v) => v.name === "Aaron") ||
                    voices.find((v) => v.name.includes("Male") && v.lang.startsWith("en")) ||
                    voices.find((v) => v.lang.startsWith("en-GB")) ||
                    voices.find((v) => v.lang.startsWith("en-US"));
                if (preferred)
                    utterance.voice = preferred;
                utterance.onend = () => setSpeaking(false);
                utterance.onerror = () => setSpeaking(false);
                window.speechSynthesis.speak(utterance);
            }
            else {
                const duration = Math.max(text.length * 50, 2000);
                setTimeout(() => setSpeaking(false), duration);
            }
        }
    });
    const stopSpeaking = () => {
        var _a;
        (_a = window.speechSynthesis) === null || _a === void 0 ? void 0 : _a.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setSpeaking(false);
    };
    // Unlock audio on iOS by speaking empty utterance on user tap
    const unlockAudio = () => {
        if (!window.speechSynthesis)
            return;
        const silence = new SpeechSynthesisUtterance("");
        silence.volume = 0;
        window.speechSynthesis.speak(silence);
    };
    const askAI = () => __awaiter(this, void 0, void 0, function* () {
        if (!question.trim())
            return;
        unlockAudio();
        setLoading(true);
        setAnswer("");
        stopSpeaking();
        try {
            const res = yield fetch(`${API_BASE}/api/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            if (!res.ok)
                throw new Error("Server error");
            const data = yield res.json();
            setAnswer(data.text);
            setLoading(false);
            speakText(data.text);
        }
        catch (err) {
            if (err instanceof Error) {
                setAnswer("Error: " + err.message);
            }
            else {
                setAnswer("Unknown error");
            }
            setLoading(false);
        }
    });
    const askWithText = (text) => __awaiter(this, void 0, void 0, function* () {
        unlockAudio();
        setLoading(true);
        setAnswer("");
        stopSpeaking();
        try {
            const res = yield fetch(`${API_BASE}/api/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: text }),
            });
            if (!res.ok)
                throw new Error("Server error");
            const data = yield res.json();
            setAnswer(data.text);
            setLoading(false);
            speakText(data.text);
        }
        catch (err) {
            setAnswer(err instanceof Error ? "Error: " + err.message : "Unknown error");
            setLoading(false);
        }
    });
    const toggleMic = () => {
        var _a;
        if (!SpeechRecognitionAPI) {
            setAnswer("Speech recognition is not supported in this browser.");
            return;
        }
        if (listening) {
            (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.stop();
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
        recognition.onresult = (event) => {
            var _a;
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            if (result.isFinal) {
                setListening(false);
                (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.stop();
                askWithText(transcript);
            }
        };
        recognition.start();
    };
    const isTalking = loading || speaking;
    return (_jsxs("section", { id: "ai-assistant-section", className: "ai-assistant-section", children: [_jsxs("div", { className: "ai-avatar-wrapper", children: [_jsx(Avatar3D, { talking: speaking, spokenText: answer }), _jsx("div", { className: `ai-status ${isTalking ? "active" : ""}`, children: listening ? "Listening..." : loading ? "Thinking..." : !serverReady ? "Waking up server..." : "" })] }), answer && (_jsx("div", { className: "speech-bubble", children: answer })), _jsxs("div", { className: "ai-input-row", children: [_jsx("input", { type: "text", placeholder: "Type or tap the mic to speak...", value: question, onChange: (e) => setQuestion(e.target.value), onKeyDown: (e) => { if (e.key === "Enter")
                            askAI(); }, disabled: loading }), _jsx("button", { className: `ai-mic-btn ${listening ? "listening" : ""}`, onClick: toggleMic, disabled: loading, title: "Voice input", children: _jsx("i", { className: listening ? "fa-solid fa-stop" : "fa-solid fa-microphone" }) }), speaking ? (_jsx("button", { onClick: stopSpeaking, className: "ai-stop-btn", children: _jsx("i", { className: "fa-solid fa-stop" }) })) : (_jsx("button", { onClick: askAI, disabled: loading, children: loading ? "..." : "Ask" }))] }), _jsx("div", { className: "ai-chips", children: quickChips.map((chip, idx) => (_jsx("button", { className: "ai-chip", onClick: () => {
                        setQuestion(chip);
                    }, children: chip }, idx))) })] }));
}
