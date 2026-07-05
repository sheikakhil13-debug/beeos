import React from "react";
import beeHero from "./assets/bee-hero.png";

export default function SwarmContent({ swarmConfig, onOpenSwarmSettings }) {
  const { enabled, beeCount, formation } = swarmConfig;

  // "You" is always Mr.Bee (slot 0). Remaining slots are the other bees,
  // shown if beeCount > 1.
  const otherBees = Array.from({ length: beeCount - 1 }, (_, i) => ({
    id: i + 2,
    label: `Bee ${i + 2}`,
    online: true,
  }));

  const positions = layoutPositions(formation, otherBees.length);

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Swarm Mode</span>
        <span
          style={{
            fontSize: "11px",
            color: enabled ? "#3ED598" : "#6b7078",
            fontWeight: 600,
          }}
        >
          {enabled ? "● Enabled" : "○ Disabled"}
        </span>
      </div>
      <p style={{ fontSize: "11.5px", color: "#6b7078", margin: "0 0 18px" }}>
        {formation} formation · {beeCount} {beeCount === 1 ? "bee" : "bees"}
      </p>

      {!enabled ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textAlign: "center",
            padding: "30px 20px",
          }}
        >
          <p style={{ fontSize: "13px", color: "#7d8390", margin: 0 }}>
            Swarm mode is turned off.
          </p>
          <p style={{ fontSize: "11.5px", color: "#5a606b", margin: 0, maxWidth: "240px" }}>
            Turn it on in Settings → Swarm Settings to coordinate multiple bees.
          </p>
        </div>
      ) : beeCount === 1 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
          }}
        >
          <BeeNode label="You" online img={beeHero} size={90} />
          <p style={{ fontSize: "11.5px", color: "#5a606b", margin: 0, textAlign: "center", maxWidth: "240px" }}>
            Solo mode — set a higher bee count in Swarm Settings to coordinate
            a swarm.
          </p>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Center node: you */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
            <BeeNode label="You" online img={beeHero} size={64} center />
          </div>

          {/* Other bees positioned around */}
          {otherBees.map((bee, i) => {
            const pos = positions[i];
            return (
              <div
                key={bee.id}
                style={{
                  position: "absolute",
                  top: `${pos.y}%`,
                  left: `${pos.x}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              >
                <BeeNode label={bee.label} online={bee.online} size={54} />
              </div>
            );
          })}

          {/* Connector lines */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {positions.slice(0, otherBees.length).map((pos, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={pos.x}
                y2={pos.y}
                stroke="#F2B544"
                strokeWidth="0.4"
                strokeDasharray="2 2"
                opacity="0.4"
              />
            ))}
          </svg>
        </div>
      )}

      {enabled && (
        <button
          onClick={onOpenSwarmSettings}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "12px",
            border: "1px solid #1f242c",
            background: "#14171d",
            color: "#EDEDED",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Swarm Settings
        </button>
      )}
    </div>
  );
}

function layoutPositions(formation, count) {
  if (formation === "Line") {
    // horizontal line below center
    const spacing = 100 / (count + 1);
    return Array.from({ length: count }, (_, i) => ({
      x: spacing * (i + 1),
      y: 82,
    }));
  }
  if (formation === "Circle") {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      return {
        x: 50 + Math.cos(angle) * 34,
        y: 50 + Math.sin(angle) * 34,
      };
    });
  }
  // Grid (default) — simple corner layout around center
  const gridSpots = [
    { x: 22, y: 22 },
    { x: 78, y: 22 },
    { x: 22, y: 78 },
    { x: 78, y: 78 },
  ];
  return gridSpots.slice(0, count);
}

function BeeNode({ label, online, img, size = 54, center }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "#0d1014",
          border: center ? "2px solid #F2B544" : "1px solid #1f242c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: center ? "0 0 18px rgba(242,181,68,0.25)" : "none",
        }}
      >
        {img ? (
          <img src={img} alt="" style={{ width: "78%", height: "78%", objectFit: "contain" }} />
        ) : (
          <BeeMark size={size * 0.4} />
        )}
      </div>
      <span style={{ fontSize: "10.5px", color: "#cfd3da", fontWeight: 600 }}>{label}</span>
      <span
        style={{
          fontSize: "9px",
          color: online ? "#3ED598" : "#6b7078",
          fontWeight: 600,
        }}
      >
        {online ? "ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}

function BeeMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="13" rx="6" ry="7" fill="#F2B544" />
      <path d="M6 11h12M6 14h12M6 17h10" stroke="#1a1306" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="6" r="3" fill="#F2B544" />
    </svg>
  );
}
