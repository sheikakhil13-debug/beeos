import React, { useState } from "react";
import SettingsSubScreen, {
  SettingsCard,
  SettingsCardLabel,
  OptionPills,
  ToggleRow,
  SliderRow,
} from "./SettingsSubScreen";

export default function AiSettingsScreen({ onBack }) {
  const [personality, setPersonality] = useState("Playful");
  const [detectionSensitivity, setDetectionSensitivity] = useState(70);
  const [personDetection, setPersonDetection] = useState(true);
  const [vehicleDetection, setVehicleDetection] = useState(true);
  const [animalDetection, setAnimalDetection] = useState(false);

  return (
    <SettingsSubScreen title="AI Settings" onBack={onBack}>
      <SettingsCard>
        <SettingsCardLabel>Mr.Bee's personality</SettingsCardLabel>
        <OptionPills
          options={["Playful", "Calm", "Formal"]}
          value={personality}
          onChange={setPersonality}
        />
      </SettingsCard>

      <SettingsCard>
        <SliderRow
          label="Detection sensitivity"
          value={detectionSensitivity}
          min={0}
          max={100}
          unit="%"
          onChange={setDetectionSensitivity}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsCardLabel>Detect and alert on</SettingsCardLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <ToggleRow
            label="People"
            value={personDetection}
            onChange={setPersonDetection}
          />
          <ToggleRow
            label="Vehicles"
            value={vehicleDetection}
            onChange={setVehicleDetection}
          />
          <ToggleRow
            label="Animals"
            value={animalDetection}
            onChange={setAnimalDetection}
          />
        </div>
      </SettingsCard>
    </SettingsSubScreen>
  );
}
