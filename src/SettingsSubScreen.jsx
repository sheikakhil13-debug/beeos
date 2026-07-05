import React from "react";

export default function SettingsSubScreen({ title, onBack, children }) {
  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
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
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <span style={{ fontSize: "16px", fontWeight: 700 }}>{title}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {children}
      </div>
    </div>
  );
}

/* Shared building blocks used across settings detail screens */

export function SettingsCard({ children }) {
  return (
    <div
      style={{
        background: "#0d1014",
        border: "1px solid #1c2027",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      {children}
    </div>
  );
}

export function SettingsCardLabel({ children }) {
  return (
    <p
      style={{
        fontSize: "11px",
        letterSpacing: "0.08em",
        color: "#6b7078",
        textTransform: "uppercase",
        margin: "0 0 12px",
      }}
    >
      {children}
    </p>
  );
}

export function OptionPills({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "9px 14px",
              borderRadius: "10px",
              border: active ? "1px solid #F2B544" : "1px solid #20242c",
              background: active ? "rgba(242,181,68,0.12)" : "#14171d",
              color: active ? "#F2B544" : "#9aa0aa",
              fontSize: "12.5px",
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function ToggleRow({ label, sublabel, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: "13.5px", color: "#EDEDED", fontWeight: 500 }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: "11.5px", color: "#6b7078", marginTop: "2px" }}>
            {sublabel}
          </div>
        )}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "44px",
        height: "26px",
        borderRadius: "13px",
        border: "none",
        background: value ? "#3ED598" : "#262b33",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "21px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}

export function SliderRow({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "13.5px", color: "#EDEDED", fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: "13px", color: "#F2B544", fontWeight: 700 }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#F2B544",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
