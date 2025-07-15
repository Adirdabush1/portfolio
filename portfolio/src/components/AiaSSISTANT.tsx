import React, { useState, useEffect } from "react";
import "./AiAssistant.css"; 
export default function AiAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "Aren't you afraid AI will replace developers like you?",
    "What technologies do you use most often in your projects?",
    "Why should someone hire you as a full stack developer?",
    "What kind of projects are you most passionate about?",
    "How can your skills help a business grow?",
    "What projects are you most proud of?",
    "Tell me about a challenging project you've completed",
    "What are your goals as a developer in the next few years?",
    "What makes you different from other developers?",
    "Can you explain how your AI assistant works?",
    "How did you build your public travel journal project?"
  ];

  useEffect(() => {
    setQuestion(suggestedQuestions[0]);
  }, []);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setAnswer(data.text);
    } catch (err) {
      if (err instanceof Error) {
        setAnswer("Error: " + err.message);
      } else {
        setAnswer("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
          id="ai-assistant-section"

      style={{
        padding: "1.5rem",
        backgroundColor: "#1e1e1e",
        color: "#eee",
        borderRadius: "12px",
        marginTop: "2rem",
        maxWidth: "800px",
        marginInline: "auto",
        textAlign: "center",
      }}
    >
      {/* Animated Title */}
      <div id="animated-title-container">
       ask{" "}
<div id="flip">
  <div><div>Adir</div></div>
  <div><div>Agent Smith</div></div>
  <div><div>The Developer</div></div>
  <div><div>Writing about Adir</div></div>
</div>{" "}
Whatever you want!

      </div>

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Ask Adir AI</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {suggestedQuestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setQuestion(prompt)}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.9rem",
              borderRadius: "6px",
              background: "#333",
              color: "#fff",
              border: "1px solid #444",
              cursor: "pointer"
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
        style={{
          width: "100%",
          padding: "0.6rem",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "1px solid #555",
          backgroundColor: "#2a2a2a",
          color: "#fff",
        }}
        disabled={loading}
      />

      <button
        onClick={askAI}
        style={{
          marginTop: "0.8rem",
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          cursor: "pointer",
          borderRadius: "6px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
        }}
        disabled={loading}
      >
        {loading ? "Loading..." : "Ask"}
      </button>

      {answer && (
        <p style={{ marginTop: "1rem", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
          {answer}
        </p>
      )}
    </section>
  );
}
