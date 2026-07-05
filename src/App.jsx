import { useState } from "react";
import SplashScreen from "./SplashScreen";
import MrBeeWelcome from "./MrBeeWelcome";
import ConnectBeeScreen from "./ConnectBeeScreen";
import AppShell from "./AppShell";
import HomeContent from "./HomeContent";
import AssistantContent from "./AssistantContent";
import SettingsContent from "./SettingsContent";
import FlightControlContent from "./FlightControlContent";
import VisionContent from "./VisionContent";
import MissionContent from "./MissionContent";
import MapContent from "./MapContent";
import AnalyticsContent from "./AnalyticsContent";
import SwarmContent from "./SwarmContent";

function App() {
  const [stage, setStage] = useState("splash"); // splash | welcome | connecting | app
  const [tab, setTab] = useState("home");
  const [language, setLanguage] = useState("English"); // shared: Settings + AI Assistant
  const [swarmConfig, setSwarmConfig] = useState({
    enabled: true,
    beeCount: 4,
    formation: "Grid",
  }); // shared: Settings + Swarm tab
  const [settingsDeepLink, setSettingsDeepLink] = useState(null);
  const [settingsSubScreenActive, setSettingsSubScreenActive] = useState(false);

  if (stage === "splash") {
    return <SplashScreen onFinish={() => setStage("welcome")} />;
  }

  if (stage === "welcome") {
    return (
      <MrBeeWelcome
        onGetStarted={() => setStage("connecting")}
        onSignIn={() => setStage("connecting")}
      />
    );
  }

  if (stage === "connecting") {
    return <ConnectBeeScreen onConnected={() => setStage("app")} />;
  }

  return (
    <AppShell active={tab} onChangeTab={setTab} hideMenuButton={tab === "settings" && settingsSubScreenActive}>
      {tab === "home" && <HomeContent />}
      {tab === "assistant" && <AssistantContent language={language} />}
      {tab === "control" && <FlightControlContent />}
      {tab === "vision" && <VisionContent />}
      {tab === "mission" && <MissionContent />}
      {tab === "map" && <MapContent />}
      {tab === "analytics" && <AnalyticsContent />}
      {tab === "swarm" && (
        <SwarmContent
          swarmConfig={swarmConfig}
          onOpenSwarmSettings={() => {
            setSettingsDeepLink("swarm");
            setTab("settings");
          }}
        />
      )}
      {tab === "settings" && (
        <SettingsContent
          language={language}
          onChangeLanguage={setLanguage}
          swarmConfig={swarmConfig}
          onChangeSwarmConfig={setSwarmConfig}
          initialSubScreen={settingsDeepLink}
          onBackToSwarmTab={() => setTab("swarm")}
          onSubScreenConsumed={() => setSettingsDeepLink(null)}
          onSubScreenActiveChange={setSettingsSubScreenActive}
          onLogout={() => {
            setStage("welcome");
            setTab("home");
          }}
        />
      )}
    </AppShell>
  );
}

export default App;
