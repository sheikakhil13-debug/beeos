import React from "react";
import beeHero from "./assets/bee-hero.png";

export default function MrBeeWelcome({ onGetStarted, onSignIn }) {
  return (
    <div className="appshell-outer">
      <div
        className="mrbee-card appshell-inner"
        style={{
          padding: "48px 28px 40px",
          alignItems: "center",
          textAlign: "center",
          overflowY: "auto",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "6px" }}>
          <span
            className="neon-text-idle"
            style={{
              fontSize: "13px",
              letterSpacing: "0.2em",
              color: "#FAD98B",
              fontWeight: 700,
              textShadow:
                "0 0 6px rgba(242,181,68,0.8), 0 0 14px rgba(242,181,68,0.5)",
            }}
          >
            BEEOS
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 46px)",
            fontWeight: 800,
            margin: "0 0 6px",
            letterSpacing: "0.01em",
            color: "#F5F6F8",
          }}
        >
          Mr<span style={{ color: "#F2B544" }}>.Bee</span>
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "#7d8390",
            letterSpacing: "0.1em",
            margin: "0 0 10px",
            textTransform: "uppercase",
          }}
        >
          AI Drone Assistant
        </p>

        {/* Hero bee illustration */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "28px 0 18px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <img
            src={beeHero}
            alt="Mr.Bee robotic bee"
            className="mrbee-float"
            style={{
              width: "clamp(240px, 46vw, 420px)",
              maxWidth: "100%",
              height: "auto",
              position: "relative",
              zIndex: 2,
              filter: "drop-shadow(0 10px 26px rgba(0,0,0,0.55))",
            }}
          />

          {/* Glowing landing pad */}
          <div
            style={{
              position: "relative",
              width: "clamp(200px, 38vw, 340px)",
              height: "clamp(52px, 10vw, 90px)",
              marginTop: "-24px",
              zIndex: 1,
            }}
          >
            {/* Outer glow spread */}
            <div style={{
              position: "absolute",
              inset: "-18px -24px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(242,181,68,0.22) 0%, rgba(242,181,68,0) 70%)",
              filter: "blur(8px)",
            }}/>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 220 58"
              preserveAspectRatio="xMidYMid meet"
              style={{ position: "absolute", inset: 0 }}
            >
              <defs>
                <radialGradient id="padGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
                  <stop offset="40%" stopColor="#F2B544" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#F2B544" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFE080" stopOpacity="1"/>
                  <stop offset="60%" stopColor="#F2B544" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#CC8800" stopOpacity="0.3"/>
                </radialGradient>
                <filter id="ringBlur">
                  <feGaussianBlur stdDeviation="1.5"/>
                </filter>
              </defs>

              {/* Filled glowing center ellipse */}
              <ellipse cx="110" cy="29" rx="96" ry="18" fill="url(#padGlow)"/>

              {/* Outer bright ring */}
              <ellipse cx="110" cy="29" rx="96" ry="18"
                fill="none"
                stroke="url(#ringGlow)"
                strokeWidth="2.5"
                filter="url(#ringBlur)"
              />
              {/* Inner ring */}
              <ellipse cx="110" cy="29" rx="66" ry="12"
                fill="none"
                stroke="#F2B544"
                strokeWidth="1.2"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* Caption */}
        <p
          style={{
            fontSize: "14px",
            color: "#9aa0aa",
            margin: "0 0 28px",
            letterSpacing: "0.02em",
          }}
        >
          Intelligent. Autonomous. Connected.
        </p>

        {/* CTA buttons */}
        <button
          onClick={onGetStarted}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
            color: "#231503",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(232,163,34,0.25)",
            marginBottom: "14px",
          }}
        >
          Get Started
        </button>

        <button
          onClick={onSignIn}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "14px",
            border: "none",
            background: "transparent",
            color: "#9aa0aa",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
