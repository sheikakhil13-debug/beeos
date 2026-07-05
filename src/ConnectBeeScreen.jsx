import React, { useState, useEffect, useRef } from "react";
import beeHero from "./assets/bee-hero.png";
import { connectToBee, isSupported, isConnected } from "./beeConnection";

// Real Web Bluetooth pairing flow.
// NOTE: navigator.bluetooth.requestDevice() only works from a direct user
// gesture (a click), so we can't auto-start the search on mount like the
// old mock version did — the user has to tap "Search for Bee".
export default function ConnectBeeScreen({ onConnected }) {
  const [phase, setPhase] = useState(isConnected() ? "connected" : "idle"); // idle | searching | connected | error
  const [errorMsg, setErrorMsg] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSearch = async () => {
    setErrorMsg("");
    setPhase("searching");
    try {
      await connectToBee();
      if (mounted.current) setPhase("connected");
    } catch (err) {
      if (!mounted.current) return;
      // User closing the device picker also lands here — treat it as idle, not an error.
      if (err.name === "NotFoundError") {
        setPhase("idle");
      } else {
        setErrorMsg(err.message || "Couldn't connect to your Bee.");
        setPhase("error");
      }
    }
  };

  return (
    <div className="appshell-outer">
      <div
        className="mrbee-card appshell-inner"
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 28px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            letterSpacing: "0.14em",
            color: "#6b7078",
            textTransform: "uppercase",
            marginBottom: "30px",
          }}
        >
          Setting up BeeOS
        </span>

        {/* Bee + pulsing connection rings */}
        <div
          style={{
            position: "relative",
            width: "clamp(160px, 32vw, 220px)",
            height: "clamp(160px, 32vw, 220px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          {phase === "searching" && (
            <>
              <PulseRing delay="0s" />
              <PulseRing delay="0.6s" />
              <PulseRing delay="1.2s" />
            </>
          )}
          <img
            src={beeHero}
            alt="Mr.Bee"
            className={phase === "connected" ? "mrbee-float" : ""}
            style={{
              width: "70%",
              height: "auto",
              position: "relative",
              zIndex: 1,
              filter:
                phase === "connected"
                  ? "drop-shadow(0 0 8px rgba(62,213,152,0.25))"
                  : "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
              transition: "filter 0.4s ease",
            }}
          />
        </div>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            margin: "0 0 8px",
            color: phase === "connected" ? "#3ED598" : phase === "error" ? "#F0615A" : "#EDEDED",
            transition: "color 0.3s ease",
          }}
        >
          {phase === "idle" && "Ready to find your Bee"}
          {phase === "searching" && "Searching for your Bee..."}
          {phase === "connected" && "Connected!"}
          {phase === "error" && "Connection failed"}
        </h2>
        <p style={{ fontSize: "12.5px", color: "#7d8390", margin: "0 0 36px", maxWidth: "260px" }}>
          {phase === "idle" && "Make sure your BeeOS device is powered on and nearby, then tap search."}
          {phase === "searching" && "Choose your Bee from the Bluetooth device list."}
          {phase === "connected" && "Mr.Bee is online and ready to go."}
          {phase === "error" && errorMsg}
        </p>

        {!isSupported() && (
          <p style={{ fontSize: "11.5px", color: "#F2B544", margin: "-24px 0 24px", maxWidth: "260px" }}>
            This browser doesn't support Bluetooth. Use Chrome on Android to connect to a real Bee.
          </p>
        )}

        {phase === "connected" ? (
          <button
            onClick={onConnected}
            style={{
              width: "100%",
              maxWidth: "280px",
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
              color: "#231503",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continue to Dashboard
          </button>
        ) : (
          <button
            onClick={handleSearch}
            disabled={phase === "searching" || !isSupported()}
            style={{
              width: "100%",
              maxWidth: "280px",
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background:
                phase === "searching" || !isSupported()
                  ? "#1c2027"
                  : "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
              color: phase === "searching" || !isSupported() ? "#5a606b" : "#231503",
              fontSize: "15px",
              fontWeight: 700,
              cursor: phase === "searching" || !isSupported() ? "default" : "pointer",
              transition: "background 0.3s ease, color 0.3s ease",
            }}
          >
            {phase === "searching" ? "Searching..." : phase === "error" ? "Try Again" : "Search for Bee"}
          </button>
        )}

        {phase !== "connected" && (
          <button
            onClick={onConnected}
            style={{
              marginTop: "14px",
              background: "none",
              border: "none",
              color: "#5a606b",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

function PulseRing({ delay }) {
  return (
    <span
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: "1.5px solid #F2B544",
        animation: "beeos-connect-pulse 1.8s ease-out infinite",
        animationDelay: delay,
      }}
    />
  );
}
