import React, { useState, useEffect } from "react";
import DroneSettingsScreen from "./DroneSettingsScreen";
import CameraSettingsScreen from "./CameraSettingsScreen";
import AiSettingsScreen from "./AiSettingsScreen";
import MissionSettingsScreen from "./MissionSettingsScreen";
import VoiceSettingsScreen from "./VoiceSettingsScreen";
import NotificationsScreen from "./NotificationsScreen";
import SwarmSettingsScreen from "./SwarmSettingsScreen";

const SETTINGS_ITEMS = [
  { id: "drone", label: "Drone Settings", icon: DroneIcon },
  { id: "camera", label: "Camera Settings", icon: CameraIcon },
  { id: "ai", label: "AI Settings", icon: AiIcon },
  { id: "mission", label: "Mission Settings", icon: MissionIcon },
  { id: "voice", label: "Voice Commands", icon: MicIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "swarm", label: "Swarm Settings", icon: SwarmIcon },
  { id: "about", label: "About BeeOS", icon: InfoIcon },
];

export default function SettingsContent({
  onLogout,
  language,
  onChangeLanguage,
  swarmConfig,
  onChangeSwarmConfig,
  initialSubScreen = null,
  onSubScreenConsumed,
  onBackToSwarmTab,
  onSubScreenActiveChange,
}) {
  const [subScreen, setSubScreen] = useState(initialSubScreen);
  // Captured once, at mount — stays true for this visit even after the
  // parent clears its own deep-link state, so the back button knows where
  // this screen was entered from.
  const [cameFromSwarmTab] = useState(initialSubScreen === "swarm");

  const back = () => {
    if (subScreen === "swarm" && cameFromSwarmTab && onBackToSwarmTab) {
      onBackToSwarmTab();
    } else {
      setSubScreen(null);
    }
  };

  useEffect(() => {
    if (initialSubScreen && onSubScreenConsumed) {
      onSubScreenConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onSubScreenActiveChange) {
      onSubScreenActiveChange(subScreen !== null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subScreen]);

  if (subScreen === "drone") return <DroneSettingsScreen onBack={back} />;
  if (subScreen === "camera") return <CameraSettingsScreen onBack={back} />;
  if (subScreen === "ai") return <AiSettingsScreen onBack={back} />;
  if (subScreen === "mission") return <MissionSettingsScreen onBack={back} />;
  if (subScreen === "voice")
    return (
      <VoiceSettingsScreen
        onBack={back}
        language={language}
        onChangeLanguage={onChangeLanguage}
      />
    );
  if (subScreen === "notifications") return <NotificationsScreen onBack={back} />;
  if (subScreen === "swarm")
    return (
      <SwarmSettingsScreen
        onBack={back}
        swarmEnabled={swarmConfig.enabled}
        onChangeSwarmEnabled={(v) => onChangeSwarmConfig({ ...swarmConfig, enabled: v })}
        beeCount={swarmConfig.beeCount}
        onChangeBeeCount={(v) => onChangeSwarmConfig({ ...swarmConfig, beeCount: v })}
        formation={swarmConfig.formation}
        onChangeFormation={(v) => onChangeSwarmConfig({ ...swarmConfig, formation: v })}
      />
    );
  if (subScreen === "about") return <AboutScreen onBack={back} />;

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "22px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Settings</span>
      </div>

      {/* Settings list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {SETTINGS_ITEMS.map((item) => (
          <SettingsRow
            key={item.id}
            label={item.label}
            Icon={item.icon}
            onClick={() => setSubScreen(item.id)}
          />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Log out */}
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "14px",
          border: "1px solid #3a1f1f",
          background: "#1a1011",
          color: "#F0615A",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
    </div>
  );
}

function AboutScreen({ onBack }) {
  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
        <button
          onClick={onBack}
          style={{
            background: "#14171d",
            border: "1px solid #20242c",
            borderRadius: "10px",
            width: "34px",
            height: "34px",
            color: "#9aa0aa",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ←
        </button>
        <span style={{ fontSize: "16px", fontWeight: 700 }}>About BeeOS</span>
      </div>
      <div
        style={{
          background: "#0d1014",
          border: "1px solid #1c2027",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", fontWeight: 700, color: "#F2B544", margin: "0 0 6px" }}>
          BeeOS
        </p>
        <p style={{ fontSize: "12px", color: "#7d8390", margin: "0 0 14px" }}>
          Version 0.1.0 — Prototype build
        </p>
        <p style={{ fontSize: "12.5px", color: "#9aa0aa", lineHeight: 1.6, margin: 0 }}>
          A bio-inspired robotic bee companion combining computer vision, edge AI,
          IoT, and aeronautics. Intelligent. Autonomous. Connected.
        </p>
      </div>
    </div>
  );
}

function SettingsRow({ label, Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0d1014",
        border: "1px solid #1c2027",
        borderRadius: "14px",
        padding: "13px 14px",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            background: "#14171d",
            border: "1px solid #20242c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon />
        </div>
        <span style={{ fontSize: "13.5px", color: "#cfd3da", fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <ChevronIcon />
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="#5a606b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DroneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#F2B544" strokeWidth="1.6" />
      <circle cx="5" cy="5" r="2" stroke="#F2B544" strokeWidth="1.4" />
      <circle cx="19" cy="5" r="2" stroke="#F2B544" strokeWidth="1.4" />
      <circle cx="5" cy="19" r="2" stroke="#F2B544" strokeWidth="1.4" />
      <circle cx="19" cy="19" r="2" stroke="#F2B544" strokeWidth="1.4" />
      <path d="M9.5 9.5L6.3 6.3M14.5 9.5l3.2-3.2M9.5 14.5l-3.2 3.2M14.5 14.5l3.2 3.2" stroke="#F2B544" strokeWidth="1.2" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="#F2B544" strokeWidth="1.6" />
      <path d="M8 7l1.5-3h5L16 7" stroke="#F2B544" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" stroke="#F2B544" strokeWidth="1.5" />
    </svg>
  );
}
function AiIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="3" stroke="#F2B544" strokeWidth="1.6" />
      <circle cx="9.5" cy="11" r="1.2" fill="#F2B544" />
      <circle cx="14.5" cy="11" r="1.2" fill="#F2B544" />
      <path d="M9 15c.8.7 1.8 1 3 1s2.2-.3 3-1" stroke="#F2B544" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function MissionIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="#F2B544" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="#F2B544" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="#F2B544" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="#F2B544" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 4a5 5 0 00-5 5v3.5l-1.5 3h13L17 12.5V9a5 5 0 00-5-5z" stroke="#F2B544" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 004 0" stroke="#F2B544" strokeWidth="1.5" />
    </svg>
  );
}
function SwarmIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2.2" stroke="#F2B544" strokeWidth="1.4" />
      <circle cx="6" cy="16" r="2.2" stroke="#F2B544" strokeWidth="1.4" />
      <circle cx="18" cy="16" r="2.2" stroke="#F2B544" strokeWidth="1.4" />
      <path d="M10.5 8l-3 6M13.5 8l3 6M8.5 16h7" stroke="#F2B544" strokeWidth="1.2" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#F2B544" strokeWidth="1.6" />
      <path d="M12 11v5.5M12 8v.01" stroke="#F2B544" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
