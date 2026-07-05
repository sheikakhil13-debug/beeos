import React from "react";
import SettingsSubScreen, { SettingsCard, SettingsCardLabel, ToggleRow } from "./SettingsSubScreen";

export default function SwarmSettingsScreen({
  onBack,
  swarmEnabled,
  onChangeSwarmEnabled,
  beeCount,
  onChangeBeeCount,
  formation,
  onChangeFormation,
}) {
  return (
    <SettingsSubScreen title="Swarm Settings" onBack={onBack}>
      <SettingsCard>
        <ToggleRow
          label="Swarm mode"
          sublabel="Coordinate multiple bees on one mission"
          value={swarmEnabled}
          onChange={onChangeSwarmEnabled}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsCardLabel>Number of bees in swarm</SettingsCardLabel>
        <div style={{ display: "flex", gap: "10px" }}>
          {[1, 2, 3, 4].map((n) => {
            const active = n === beeCount;
            return (
              <button
                key={n}
                onClick={() => onChangeBeeCount(n)}
                style={{
                  flex: 1,
                  aspectRatio: "1",
                  borderRadius: "12px",
                  border: active ? "1px solid #F2B544" : "1px solid #20242c",
                  background: active ? "rgba(242,181,68,0.12)" : "#14171d",
                  color: active ? "#F2B544" : "#9aa0aa",
                  fontSize: "18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: "11.5px", color: "#6b7078", margin: "12px 0 0" }}>
          {beeCount === 1
            ? "Solo mode — just Mr.Bee, no swarm coordination."
            : `${beeCount} bees will coordinate together on missions.`}
        </p>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardLabel>Formation</SettingsCardLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["Grid", "Line", "Circle"].map((f) => {
            const active = f === formation;
            return (
              <button
                key={f}
                onClick={() => onChangeFormation(f)}
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
                {f}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </SettingsSubScreen>
  );
}
