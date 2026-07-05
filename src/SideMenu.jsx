import React from "react";
import { SECONDARY_TABS } from "./BottomNav";

export default function SideMenu({ open, active, onChange, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
          zIndex: 9998,
          borderRadius: "28px",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "72%",
          maxWidth: "260px",
          background: "#0d1014",
          borderRight: "1px solid #1c2027",
          borderTopLeftRadius: "28px",
          borderBottomLeftRadius: "28px",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s ease",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          padding: "22px 14px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "26px" }}>
          <BeeIcon size={20} />
          <span style={{ fontSize: "13px", letterSpacing: "0.12em", color: "#F2B544", fontWeight: 700 }}>
            BEEOS
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {SECONDARY_TABS.map((tab) => {
            const isActive = tab.id === active;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onChange(tab.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 10px",
                  borderRadius: "10px",
                  border: "none",
                  background: isActive ? "rgba(242,181,68,0.1)" : "transparent",
                  color: isActive ? "#F2B544" : "#9aa0aa",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon active={isActive} />
                <span style={{ fontSize: "13.5px", fontWeight: isActive ? 700 : 500 }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function BeeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="13" rx="6" ry="7" fill="#F2B544" />
      <path d="M6 11h12M6 14h12M6 17h10" stroke="#1a1306" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="6" r="3" fill="#F2B544" />
    </svg>
  );
}
