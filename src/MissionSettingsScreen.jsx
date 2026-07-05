import React, { useState } from "react";
import SettingsSubScreen, {
  SettingsCard,
  SettingsCardLabel,
  OptionPills,
  ToggleRow,
  SliderRow,
} from "./SettingsSubScreen";

export default function MissionSettingsScreen({ onBack }) {
  const [returnTrigger, setReturnTrigger] = useState("Low battery");
  const [waypointRadius, setWaypointRadius] = useState(3);
  const [obstacleAvoidance, setObstacleAvoidance] = useState(true);
  const [autoResume, setAutoResume] = useState(false);

  return (
    <SettingsSubScreen title="Mission Settings" onBack={onBack}>
      <SettingsCard>
        <SettingsCardLabel>Return home trigger</SettingsCardLabel>
        <OptionPills
          options={["Low battery", "Signal lost", "Manual only"]}
          value={returnTrigger}
          onChange={setReturnTrigger}
        />
      </SettingsCard>

      <SettingsCard>
        <SliderRow
          label="Waypoint arrival radius"
          value={waypointRadius}
          min={1}
          max={10}
          unit=" m"
          onChange={setWaypointRadius}
        />
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label="Obstacle avoidance"
          sublabel="Reroute around detected obstacles mid-mission"
          value={obstacleAvoidance}
          onChange={setObstacleAvoidance}
        />
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label="Auto-resume after interruption"
          sublabel="Continue mission from last waypoint"
          value={autoResume}
          onChange={setAutoResume}
        />
      </SettingsCard>
    </SettingsSubScreen>
  );
}
