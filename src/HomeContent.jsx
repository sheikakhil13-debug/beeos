import React, { useState, useEffect, useRef } from "react";
import beeHero from "./assets/bee-hero.png";
import beeFront from "./assets/bee-angles/bee-front.png";
import beeFront45 from "./assets/bee-angles/bee-front45.png";
import beeRight from "./assets/bee-angles/bee-right.png";
import beeLeft from "./assets/bee-angles/bee-left.png";
import beeBack45 from "./assets/bee-angles/bee-back45.png";
import beeBack from "./assets/bee-angles/bee-back.png";
import beeTop from "./assets/bee-angles/bee-top.png";
import beeBottom from "./assets/bee-angles/bee-bottom.png";
import beeTopdown from "./assets/bee-angles/bee-topdown.png";

// Map rotation angle (0-360) to correct bee image
// 9 frames spread across 360deg = 40deg per frame
const BEE_FRAMES = [
  { angle: 0,   img: beeFront,    label: "Front" },
  { angle: 40,  img: beeFront45,  label: "Front 45°" },
  { angle: 80,  img: beeRight,    label: "Right Side" },
  { angle: 120, img: beeBack45,   label: "Back 45°" },
  { angle: 160, img: beeBack,     label: "Back" },
  { angle: 200, img: beeBottom,   label: "Bottom" },
  { angle: 240, img: beeLeft,     label: "Left Side" },
  { angle: 280, img: beeTop,      label: "Top View" },
  { angle: 320, img: beeTopdown,  label: "Top-Down" },
];

function getBeeImage(rotation) {
  // Normalize to 0-360
  const normalized = ((rotation % 360) + 360) % 360;
  // Find closest frame
  let closest = BEE_FRAMES[0];
  let minDiff = 360;
  for (const frame of BEE_FRAMES) {
    const diff = Math.abs(normalized - frame.angle);
    const wrappedDiff = Math.min(diff, 360 - diff);
    if (wrappedDiff < minDiff) {
      minDiff = wrappedDiff;
      closest = frame;
    }
  }
  return closest;
}

const WHISPER_LINES = [
  "All systems nominal.",
  "Battery strong, ready when you are.",
  "Watching the perimeter.",
  "Signal steady, GPS locked.",
  "Standing by, nothing unusual.",
];

export default function HomeContent() {
  const [battery, setBattery] = useState(92);
  const [flightSeconds, setFlightSeconds] = useState(4 * 60 + 35);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [rotation, setRotation] = useState(0); // degrees, Y-axis spin
  const dragState = useRef({ dragging: false, startX: 0, startRotation: 0 });

  useEffect(() => {
    const t = setInterval(() => {
      setFlightSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setWhisperIndex((i) => (i + 1) % WHISPER_LINES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const mm = Math.floor(flightSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (flightSeconds % 60).toString().padStart(2, "0");

  const onDragStart = (clientX) => {
    dragState.current = { dragging: true, startX: clientX, startRotation: rotation };
  };
  const onDragMove = (clientX) => {
    if (!dragState.current.dragging) return;
    const deltaX = clientX - dragState.current.startX;
    // 40deg per frame, ~30px drag per frame feels natural
    setRotation(dragState.current.startRotation + deltaX * 1.5);
  };
  const onDragEnd = () => {
    dragState.current.dragging = false;
  };

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top bar — left side reserved for the hamburger button in AppShell */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginBottom: "12px",
          paddingLeft: "46px", // keeps content clear of the floating hamburger button
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "#14171d",
            border: "1px solid #20242c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BellIcon />
        </div>
      </div>

      {/* Status card */}
      <div
        style={{
          background: "linear-gradient(180deg, #12151b 0%, #0d1014 100%)",
          border: "1px solid #1f242c",
          borderRadius: "20px",
          padding: "14px 16px 16px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#3ED598",
                boxShadow: "0 0 8px #3ED598",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "13px", color: "#9aa0aa" }}>
              Bee status
            </span>
          </div>
          <BatteryRing value={battery} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#3ED598" }}>
            Online
          </span>
        </div>

        {/* Hero bee illustration — drag horizontally to rotate 360° */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "8px 0 6px",
          }}
        >
          <div
            onMouseDown={(e) => onDragStart(e.clientX)}
            onMouseMove={(e) => onDragMove(e.clientX)}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onTouchEnd={onDragEnd}
            style={{
              cursor: "grab",
              touchAction: "pan-y",
              userSelect: "none",
            }}
          >
            <img
              src={getBeeImage(rotation).img}
              alt={`Mr.Bee — ${getBeeImage(rotation).label}`}
              draggable={false}
              style={{
                width: "clamp(140px, 22vh, 280px)",
                maxWidth: "100%",
                height: "auto",
                position: "relative",
                zIndex: 2,
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
                userSelect: "none",
              }}
            />
          </div>

          {/* Glowing landing pad */}
          <div
            style={{
              position: "relative",
              width: "clamp(120px, 18vh, 240px)",
              height: "clamp(30px, 5vh, 60px)",
              marginTop: "-12px",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <div style={{
              position: "absolute",
              inset: "-14px -18px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(242,181,68,0.2) 0%, rgba(242,181,68,0) 70%)",
              filter: "blur(6px)",
            }}/>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 220 58"
              preserveAspectRatio="xMidYMid meet"
              style={{ position: "absolute", inset: 0 }}
            >
              <defs>
                <radialGradient id="padGlow2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
                  <stop offset="40%" stopColor="#F2B544" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#F2B544" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="ringGlow2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFE080" stopOpacity="1"/>
                  <stop offset="60%" stopColor="#F2B544" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#CC8800" stopOpacity="0.3"/>
                </radialGradient>
                <filter id="ringBlur2">
                  <feGaussianBlur stdDeviation="1.5"/>
                </filter>
              </defs>
              <ellipse cx="110" cy="29" rx="96" ry="18" fill="url(#padGlow2)"/>
              <ellipse cx="110" cy="29" rx="96" ry="18"
                fill="none" stroke="url(#ringGlow2)" strokeWidth="2.5"
                filter="url(#ringBlur2)"
              />
              <ellipse cx="110" cy="29" rx="66" ry="12"
                fill="none" stroke="#F2B544" strokeWidth="1.2" opacity="0.5"
              />
            </svg>
          </div>

          <span style={{ fontSize: "10px", color: "#4a4f58", marginTop: "4px" }}>
            Drag to rotate
          </span>
        </div>

        {/* Mini stat row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          <MiniStat icon={<SignalIcon />} label="Signal" value="Strong" valueColor="#3ED598" />
          <MiniStat icon={<GpsIcon />} label="GPS" value="Active" valueColor="#3ED598" />
          <MiniStat icon={<TempIcon />} label="Temp." value="32°C" valueColor="#F2B544" />
        </div>
      </div>

      {/* Live camera feed card */}
      <div
        style={{
          background: "#0d1014",
          border: "1px solid #1f242c",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px 10px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#9aa0aa", fontWeight: 500 }}>
            Live camera feed
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              color: "#F0615A",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#F0615A",
              }}
            />
            REC
          </span>
        </div>

        <div
          style={{
            height: "clamp(100px, 16vh, 180px)",
            margin: "0 10px",
            borderRadius: "12px",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, #7fb6dd 0%, #a9c98f 45%, #5c7a44 100%)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            padding: "14px 14px 16px",
          }}
        >
          <FeedStat label="Altitude" value="15 m" />
          <FeedStat label="Speed" value="8 km/h" />
          <FeedStat label="Distance" value="120 m" />
          <FeedStat label="Flight time" value={`${mm}:${ss}`} />
        </div>
      </div>

      {/* Status whisper — Mr.Bee's quiet presence line, replaces the old action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "14px 10px",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "#F2B544",
            boxShadow: "0 0 6px rgba(242,181,68,0.7)",
            flexShrink: 0,
          }}
        />
        <span
          key={whisperIndex}
          className="neon-text"
          style={{
            fontSize: "12.5px",
            color: "#9aa0aa",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          {WHISPER_LINES[whisperIndex]}
        </span>
      </div>

      <div style={{ textAlign: "center", marginTop: "6px" }}>
        <span style={{ fontSize: "12px", color: "#6b7078" }}>
          Intelligent. Autonomous. Connected.
        </span>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, valueColor }) {
  return (
    <div
      style={{
        background: "#14171d",
        border: "1px solid #1f242c",
        borderRadius: "12px",
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {icon}
        <span style={{ fontSize: "10px", color: "#7d8390" }}>{label}</span>
      </div>
      <span style={{ fontSize: "12px", fontWeight: 600, color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

function FeedStat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "10px", color: "#6b7078", marginBottom: "3px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#EDEDED" }}>
        {value}
      </div>
    </div>
  );
}

function BatteryRing({ value }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: "44px", height: "44px" }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} stroke="#1f242c" strokeWidth="4" fill="none" />
        <circle
          cx="22"
          cy="22"
          r={r}
          stroke="#3ED598"
          strokeWidth="4"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: 700,
          color: "#3ED598",
        }}
      >
        {value}%
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h2v-4H4v4zm6 0h2v-8h-2v8zm6 0h2v-12h-2v12zm6 0h2V4h-2v16z" fill="#3ED598" />
    </svg>
  );
}
function GpsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill="#3ED598" />
      <circle cx="12" cy="12" r="8" stroke="#3ED598" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function TempIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="10" y="4" width="4" height="11" rx="2" stroke="#F2B544" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="3" fill="#F2B544" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4a5 5 0 00-5 5v3.5l-1.5 3h13L17 12.5V9a5 5 0 00-5-5z"
        stroke="#9aa0aa"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 004 0" stroke="#9aa0aa" strokeWidth="1.5" />
    </svg>
  );
}
