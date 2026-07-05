import React from "react";

const PRIMARY_TABS = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "control", label: "Control", icon: ControlIcon },
  { id: "assistant", label: "AI Assistant", icon: MicIcon },
  { id: "vision", label: "Vision", icon: VisionIcon },
];

const SECONDARY_TABS = [
  { id: "mission", label: "Mission", icon: MissionIcon },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "analytics", label: "Analytics", icon: AnalyticsIcon },
  { id: "swarm", label: "Swarm", icon: SwarmIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const ALL_TABS = [...PRIMARY_TABS, ...SECONDARY_TABS];

export default function BottomNav({ active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        borderTop: "1px solid #1c2027",
        background: "#0a0c10",
        padding: "8px 4px",
        borderBottomLeftRadius: "28px",
        borderBottomRightRadius: "28px",
      }}
    >
      {PRIMARY_TABS.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px 6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isActive ? "#F2B544" : "#6b7078",
            }}
          >
            <Icon active={isActive} />
            <span
              style={{
                fontSize: "9.5px",
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const strokeColor = (active) => (active ? "#F2B544" : "#6b7078");

function HomeIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" stroke={strokeColor(active)} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ControlIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={strokeColor(active)} strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke={strokeColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function VisionIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke={strokeColor(active)} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke={strokeColor(active)} strokeWidth="1.8" />
    </svg>
  );
}
function MissionIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={strokeColor(active)} strokeWidth="1.8" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke={strokeColor(active)} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function MapIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" stroke={strokeColor(active)} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" stroke={strokeColor(active)} strokeWidth="1.4" />
    </svg>
  );
}
function MicIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke={strokeColor(active)} strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={strokeColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function AnalyticsIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke={strokeColor(active)} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function SwarmIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2.4" stroke={strokeColor(active)} strokeWidth="1.6" />
      <circle cx="6" cy="16" r="2.4" stroke={strokeColor(active)} strokeWidth="1.6" />
      <circle cx="18" cy="16" r="2.4" stroke={strokeColor(active)} strokeWidth="1.6" />
      <path d="M10.5 8l-3 6M13.5 8l3 6M8.5 16h7" stroke={strokeColor(active)} strokeWidth="1.4" />
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={strokeColor(active)} strokeWidth="1.8" />
      <path
        d="M19 12a7 7 0 00-.2-1.6l2-1.5-2-3.4-2.3.9a7 7 0 00-2.8-1.6L13.3 2h-2.6l-.4 2.8a7 7 0 00-2.8 1.6l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .5.1 1.1.2 1.6l-2 1.5 2 3.4 2.3-.9a7 7 0 002.8 1.6l.4 2.8h2.6l.4-2.8a7 7 0 002.8-1.6l2.3.9 2-3.4-2-1.5c.1-.5.2-1.1.2-1.6z"
        stroke={strokeColor(active)}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { PRIMARY_TABS, SECONDARY_TABS, ALL_TABS };
