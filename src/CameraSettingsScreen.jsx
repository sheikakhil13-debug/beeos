import React, { useState } from "react";
import SettingsSubScreen, {
  SettingsCard,
  SettingsCardLabel,
  OptionPills,
  ToggleRow,
} from "./SettingsSubScreen";

export default function CameraSettingsScreen({ onBack }) {
  const [resolution, setResolution] = useState("1080p");
  const [frameRate, setFrameRate] = useState("30fps");
  const [nightMode, setNightMode] = useState(false);
  const [autoRecord, setAutoRecord] = useState(true);
  const [gridLines, setGridLines] = useState(false);

  return (
    <SettingsSubScreen title="Camera Settings" onBack={onBack}>
      <SettingsCard>
        <SettingsCardLabel>Resolution</SettingsCardLabel>
        <OptionPills
          options={["720p", "1080p", "4K"]}
          value={resolution}
          onChange={setResolution}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsCardLabel>Frame rate</SettingsCardLabel>
        <OptionPills
          options={["24fps", "30fps", "60fps"]}
          value={frameRate}
          onChange={setFrameRate}
        />
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label="Night mode"
          sublabel="Enhances visibility in low light"
          value={nightMode}
          onChange={setNightMode}
        />
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label="Auto-record on takeoff"
          value={autoRecord}
          onChange={setAutoRecord}
        />
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label="Show grid lines"
          sublabel="Overlay framing grid on the live feed"
          value={gridLines}
          onChange={setGridLines}
        />
      </SettingsCard>
    </SettingsSubScreen>
  );
}
