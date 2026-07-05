import React, { useState } from "react";
import SettingsSubScreen, {
  SettingsCard,
  SettingsCardLabel,
  OptionPills,
  ToggleRow,
  SliderRow,
} from "./SettingsSubScreen";

export default function DroneSettingsScreen({ onBack }) {
  const [units, setUnits] = useState("Metric");
  const [autoLand, setAutoLand] = useState(true);
  const [autoLandPct, setAutoLandPct] = useState(15);
  const [maxAltitude, setMaxAltitude] = useState(120);
  const [maxSpeed, setMaxSpeed] = useState(8);

  return (
    <SettingsSubScreen title="Drone Settings" onBack={onBack}>
      <SettingsCard>
        <SettingsCardLabel>Units</SettingsCardLabel>
        <OptionPills
          options={["Metric", "Imperial"]}
          value={units}
          onChange={setUnits}
        />
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label="Auto-land on low battery"
          sublabel="Mr.Bee lands automatically when battery is low"
          value={autoLand}
          onChange={setAutoLand}
        />
        {autoLand && (
          <div style={{ marginTop: "16px" }}>
            <SliderRow
              label="Trigger battery level"
              value={autoLandPct}
              min={5}
              max={30}
              unit="%"
              onChange={setAutoLandPct}
            />
          </div>
        )}
      </SettingsCard>

      <SettingsCard>
        <SliderRow
          label="Max altitude"
          value={maxAltitude}
          min={10}
          max={400}
          step={10}
          unit=" m"
          onChange={setMaxAltitude}
        />
      </SettingsCard>

      <SettingsCard>
        <SliderRow
          label="Max speed"
          value={maxSpeed}
          min={1}
          max={25}
          unit=" km/h"
          onChange={setMaxSpeed}
        />
      </SettingsCard>
    </SettingsSubScreen>
  );
}
