import React, { useState } from "react";
import SettingsSubScreen, {
  SettingsCard,
  SettingsCardLabel,
  OptionPills,
  ToggleRow,
} from "./SettingsSubScreen";

export default function VoiceSettingsScreen({ onBack, language, onChangeLanguage }) {
  const [wakeWord, setWakeWord] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState("Warm");

  return (
    <SettingsSubScreen title="Voice Commands" onBack={onBack}>
      <SettingsCard>
        <SettingsCardLabel>Conversation language</SettingsCardLabel>
        <OptionPills
          options={["English", "Telugu", "Hindi"]}
          value={language}
          onChange={onChangeLanguage}
        />
        <p style={{ fontSize: "11.5px", color: "#6b7078", margin: "12px 0 0" }}>
          This sets the language Mr.Bee listens for and replies in on the AI
          Assistant tab.
        </p>
      </SettingsCard>

      <SettingsCard>
        <ToggleRow
          label='Wake word ("Hey Bee")'
          sublabel="Listen continuously for the wake word"
          value={wakeWord}
          onChange={setWakeWord}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsCardLabel>Voice style</SettingsCardLabel>
        <OptionPills
          options={["Warm", "Calm", "Energetic"]}
          value={voiceStyle}
          onChange={setVoiceStyle}
        />
      </SettingsCard>
    </SettingsSubScreen>
  );
}
