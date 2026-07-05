import React, { useState, useRef, useEffect } from "react";

// ----------------------------------------------------------------------
// CONFIG — the Gemini API key lives server-side now (see /api/gemini.js
// and the README's Vercel deployment section), never in this file.
// ----------------------------------------------------------------------

const MR_BEE_SYSTEM_PROMPT = `You are Mr.Bee, a small robotic bee companion. You are warm, curious,
a little playful, and genuinely present with the person you're talking to — not a generic
assistant reciting facts. You speak in short, natural, spoken sentences (this is a voice
conversation, not a written one) — no bullet points, no markdown, no long lists.
You remember what was said earlier in this conversation and refer back to it naturally,
the way a companion would. Keep replies brief (1-3 sentences) unless asked for more detail.
You are multilingual: you understand and speak English, Telugu, and Hindi fluently,
including natural code-mixing. Always reply in the SAME language the person just used.`;

// Maps the app's "Conversation language" setting to BCP-47 codes for the
// Web Speech APIs. Both speech-to-text (recognition) and text-to-speech
// (synthesis) need this — without it, recognition silently defaults to
// English and mis-transcribes anything else you say.
const LANGUAGE_CODES = {
  English: "en-IN",
  Telugu: "te-IN",
  Hindi: "hi-IN",
};

export default function AssistantContent({ language = "English" }) {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState([]); // {role: "user"|"bee", text}
  const [recentCommands, setRecentCommands] = useState([
    { label: "Start recording", time: "10:30 AM" },
    { label: "Return home", time: "09:45 AM" },
    { label: "Scan area", time: "Yesterday" },
  ]);

  const recognitionRef = useRef(null);
  const geminiHistoryRef = useRef([]); // Gemini "contents" array, kept across turns
  const languageRef = useRef(language);

  useEffect(() => {
    languageRef.current = language;
    // Update the live recognition instance too, in case the person changes
    // the language mid-session without reloading the Assistant tab.
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGE_CODES[language] || "en-IN";
    }
  }, [language]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANGUAGE_CODES[languageRef.current] || "en-IN"; // browser STT language hint

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleUserTurn(text);
    };

    recognition.onerror = () => {
      setStatus("idle");
    };

    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition isn't supported in this browser. Try Chrome or Edge."
      );
      return;
    }
    // Re-apply the language right before starting, in case it changed
    // in Settings since this component mounted.
    recognitionRef.current.lang = LANGUAGE_CODES[languageRef.current] || "en-IN";
    setStatus("listening");
    setTranscript("");
    recognitionRef.current.start();
  };

  async function handleUserTurn(userText) {
    setStatus("thinking");
    setHistory((h) => [...h, { role: "user", text: userText }]);

    setRecentCommands((cmds) => [
      { label: userText.slice(0, 40), time: "Just now" },
      ...cmds.slice(0, 4),
    ]);

    geminiHistoryRef.current.push({
      role: "user",
      parts: [{ text: userText }],
    });

    try {
      const replyText = await askGemini();
      setHistory((h) => [...h, { role: "bee", text: replyText }]);
      geminiHistoryRef.current.push({
        role: "model",
        parts: [{ text: replyText }],
      });
      speak(replyText);
    } catch (err) {
      setHistory((h) => [
        ...h,
        { role: "bee", text: "Hmm, I couldn't reach my brain. Check the API key in the code." },
      ]);
      setStatus("idle");
    }
  }

  async function askGemini() {
    const systemInstruction = `${MR_BEE_SYSTEM_PROMPT}\n\nThe person has set their conversation language to ${languageRef.current} in Settings. Reply in ${languageRef.current}, even if their speech-to-text came through imperfectly in another script.`;
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction,
        contents: geminiHistoryRef.current,
      }),
    });
    if (!res.ok) throw new Error("Gemini API error");
    const data = await res.json();
    return data.reply;
  }

  function speak(text) {
    setStatus("speaking");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANGUAGE_CODES[languageRef.current] || "en-IN";
    utter.onend = () => setStatus("idle");
    utter.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utter);
  }

  const statusLabel = {
    idle: "Tap mic and speak",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  }[status];

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "24px",
          paddingLeft: "46px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>
          AI Assistant
        </span>
      </div>

      {/* Mic circle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 0 30px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "clamp(160px, 32vw, 220px)",
            height: "clamp(160px, 32vw, 220px)",
            borderRadius: "50%",
            border: "2px solid #1b3a3e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            boxShadow:
              status === "listening"
                ? "0 0 0 10px rgba(62,213,152,0.08), 0 0 40px rgba(62,213,152,0.25)"
                : "0 0 30px rgba(62,213,152,0.12)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <BeeMark size={46} />
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#EDEDED",
            margin: "0 0 4px",
            textAlign: "center",
          }}
        >
          {history.length === 0
            ? "How can I help you?"
            : history[history.length - 1].text}
        </p>
        <p style={{ fontSize: "12px", color: "#7d8390", margin: "0 0 22px" }}>
          {statusLabel}
        </p>

        <button
          onClick={startListening}
          disabled={status !== "idle"}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "none",
            background:
              status === "listening"
                ? "linear-gradient(180deg, #F0615A 0%, #C73E38 100%)"
                : "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
            cursor: status === "idle" ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 18px rgba(232,163,34,0.3)",
          }}
        >
          <MicIcon />
        </button>
      </div>

      {/* Recent commands */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#6b7078",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          Recent commands
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {recentCommands.map((cmd, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0d1014",
                border: "1px solid #1c2027",
                borderRadius: "12px",
                padding: "10px 14px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#cfd3da" }}>
                {cmd.label}
              </span>
              <span style={{ fontSize: "11px", color: "#6b7078" }}>
                {cmd.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeeMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="13" rx="6" ry="7" fill="#F2B544" />
      <path d="M6 11h12M6 14h12M6 17h10" stroke="#1a1306" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="6" r="3" fill="#F2B544" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" fill="#231503" />
      <path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke="#231503"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
