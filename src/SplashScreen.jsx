import React, { useEffect, useState } from "react";
import beeHero from "./assets/bee-hero.png";

const BEE_FLY_DURATION_MS = 1300;
const TEXT_DELAY_MS = 1100;
const TOTAL_DURATION_MS = 3200;

export default function SplashScreen({ onFinish }) {
  const [showText, setShowText] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), TEXT_DELAY_MS);
    const fadeTimer = setTimeout(() => setFadingOut(true), TOTAL_DURATION_MS - 400);
    const doneTimer = setTimeout(() => onFinish(), TOTAL_DURATION_MS);
    const dotTimer = setInterval(() => {
      setDotCount((d) => (d % 3) + 1);
    }, 350);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      clearInterval(dotTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="appshell-outer">
      <div
        className="mrbee-card appshell-inner"
        style={{
          background: "#07080a",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadingOut ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        <img
          src={beeHero}
          alt="BeeOS"
          style={{
            width: "clamp(150px, 28vw, 220px)",
            height: "auto",
            marginBottom: "20px",
            position: "relative",
            zIndex: 1,
          }}
        />

        {showText && (
          <>
            <span
              className="neon-text neon-text-idle"
              style={{
                fontSize: "clamp(38px, 9vw, 58px)",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#FBC246",
                fontFamily: "'Arial Black', 'Inter', sans-serif",
                textShadow:
                  "0 0 8px rgba(242,181,68,0.9), 0 0 22px rgba(242,181,68,0.6), 0 0 40px rgba(242,181,68,0.3)",
                position: "relative",
                zIndex: 1,
              }}
            >
              BEEOS
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "14px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <TaglineLine />
              <span
                style={{
                  fontSize: "13px",
                  color: "#cfd3da",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Robotic Bee Operating System
              </span>
              <TaglineLine />
            </div>
          </>
        )}

        {/* Loading indicator, bottom of card */}
        {showText && (
          <div
            style={{
              position: "absolute",
              bottom: "44px",
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              zIndex: 1,
            }}
          >
            <HexLoadingIcon />
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                color: "#9aa0aa",
                fontWeight: 500,
                width: "84px",
                textAlign: "left",
              }}
            >
              LOADING{".".repeat(dotCount)}
            </span>
            <div
              style={{
                width: "150px",
                height: "4px",
                borderRadius: "2px",
                background: "#1c2027",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "2px",
                  background: "linear-gradient(90deg, #E8A322 0%, #FBC246 100%)",
                  boxShadow: "0 0 8px rgba(242,181,68,0.7)",
                  animation: `splash-progress-fill ${(TOTAL_DURATION_MS - TEXT_DELAY_MS) / 1000}s ease-out forwards`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaglineLine() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "#F2B544",
          boxShadow: "0 0 5px rgba(242,181,68,0.8)",
        }}
      />
      <span
        style={{
          width: "32px",
          height: "1px",
          background:
            "linear-gradient(90deg, rgba(242,181,68,0.7), rgba(242,181,68,0.1))",
        }}
      />
    </div>
  );
}

function HexLoadingIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "mrbee-spin 1.6s linear infinite" }}
    >
      <path
        d="M12 2l8 4.6v9.8L12 21l-8-4.6V6.6L12 2z"
        stroke="#F2B544"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}
