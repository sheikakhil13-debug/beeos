import React, { useState } from "react";
import SettingsSubScreen, { SettingsCard, ToggleRow } from "./SettingsSubScreen";

export default function NotificationsScreen({ onBack }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [intruderAlert, setIntruderAlert] = useState(true);
  const [lowBattery, setLowBattery] = useState(true);
  const [missionComplete, setMissionComplete] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  return (
    <SettingsSubScreen title="Notifications" onBack={onBack}>
      <SettingsCard>
        <ToggleRow
          label="Push notifications"
          sublabel="Master switch for all alerts below"
          value={pushEnabled}
          onChange={setPushEnabled}
        />
      </SettingsCard>

      <SettingsCard>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            opacity: pushEnabled ? 1 : 0.4,
            pointerEvents: pushEnabled ? "auto" : "none",
          }}
        >
          <ToggleRow
            label="Intruder detected"
            sublabel="Person or vehicle detected on watch"
            value={intruderAlert}
            onChange={setIntruderAlert}
          />
          <ToggleRow
            label="Low battery"
            value={lowBattery}
            onChange={setLowBattery}
          />
          <ToggleRow
            label="Mission complete"
            value={missionComplete}
            onChange={setMissionComplete}
          />
          <ToggleRow
            label="Weekly summary"
            sublabel="Flight time and activity recap"
            value={weeklySummary}
            onChange={setWeeklySummary}
          />
        </div>
      </SettingsCard>
    </SettingsSubScreen>
  );
}
