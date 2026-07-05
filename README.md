# BeeOS — App

React + Vite app. Flow: Splash screen -> Welcome -> Connect Your Bee ->
full app shell with bottom navigation. The bottom bar shows 4 primary tabs
(Home, Control, AI Assistant, Vision); the remaining 5 (Mission, Map,
Analytics, Swarm, Settings) live behind the hamburger menu, top-left. The
app/product is called BeeOS; the voice assistant character living inside it
is named Mr.Bee.

## Run it in VS Code

1. Unzip this folder, open it in VS Code (File -> Open Folder)
2. Open the terminal: Ctrl + ` (backtick)
3. Install dependencies:
   ```
   npm install
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Terminal will show a local URL, usually `http://localhost:5173` — open that
   in your browser, **in Chrome or Edge** (needed for the AI Assistant and
   Vision tabs).

Note: with plain `npm run dev`, every tab works **except** the AI Assistant's
replies — that needs the `/api` backend function, which only runs once
deployed (or via `vercel dev`, see the deployment section below).

## Set up the AI Assistant (live voice chat)

The AI Assistant tab actually talks to Gemini — it's not just a mockup. The
API key is **kept server-side**, in a small backend function under `/api`,
so it's never exposed in the browser — this matters once you deploy the app
publicly (see the deployment section below).

**For local development, the `/api` function only runs once deployed to
Vercel** (or via the Vercel CLI's `vercel dev`, see below) — plain
`npm run dev` won't have anywhere to send the request, so the AI Assistant
tab won't get replies until you've deployed or run `vercel dev`.

## Deploying BeeOS to Vercel (free, gives you a public link for your phone)

This gets you a real `https://...vercel.app` link you can open on your phone,
with the Gemini API key safely hidden server-side.

### 1. Get a free Gemini API key
Go to https://aistudio.google.com/apikey, sign in with Google, create a key.
No credit card needed.

### 2. Push this project to GitHub
Vercel deploys from a GitHub repo. If you don't already have one:
```
git init
git add .
git commit -m "BeeOS"
```
Then create a new repo on https://github.com/new and follow its instructions
to push this code there.

### 3. Import the project into Vercel
1. Go to https://vercel.com and sign in (GitHub login is easiest)
2. Click "Add New" → "Project"
3. Select your BeeOS GitHub repo and click Import
4. Framework preset should auto-detect as **Vite** — leave defaults as-is

### 4. Add your API key as an environment variable
Still in the Vercel project setup screen (or later under Project → Settings
→ Environment Variables):
- Name: `GEMINI_API_KEY`
- Value: your actual key from step 1
- Apply to: Production, Preview, and Development

This is the key step that keeps your key out of the browser — Vercel injects
it only inside the serverless function at `/api/gemini.js`, never into the
React app that ships to visitors.

### 5. Deploy
Click "Deploy". After a minute or two, Vercel gives you a live link like
`https://beeos-yourname.vercel.app` — open that on your phone's browser
(Chrome or Edge for the AI Assistant and Vision tabs to work fully) and the
whole app runs there, no install needed.

Every time you push new commits to GitHub, Vercel automatically redeploys.

### Testing the API proxy locally (optional)
If you want the AI Assistant to work while running locally (not just after
deploying), install the Vercel CLI and run:
```
npm install -g vercel
vercel dev
```
This runs both the Vite frontend and the `/api` function together locally,
using a `.env.local` file with `GEMINI_API_KEY=your-key-here` in the project
root (create this file yourself — it's gitignored by default so your key
never gets committed).

## Mission Planner (real map, no API key needed)

The Mission Planner tab uses **Leaflet + OpenStreetMap** (satellite tiles from
Esri, street tiles from OpenStreetMap) — both completely free, no API key, no
billing account, nothing to sign up for. It just works out of the box.

- Tap the map to drop a waypoint
- Drag a pin to move it
- Click a pin to remove it
- Toggle between satellite and street view with the button top-right

The default map center is Vijayawada, AP — change `DEFAULT_CENTER` in
`src/MissionContent.jsx` if you want it centered somewhere else.

## What's built

All 9 tabs are built — this is a complete app, not a partial mockup.

| Tab | Status |
|---|---|
| Home | ✅ Status card, 360°-drag bee, battery ring, camera feed preview, status whisper line |
| AI Assistant | ✅ Live Gemini voice chat (needs your API key) |
| Control | ✅ Joystick/manual modes, take off/land simulation, live-panning camera |
| Vision | ✅ Real webcam + real object detection (TensorFlow.js) |
| Mission | ✅ Real map (Leaflet/OpenStreetMap), click-to-add waypoints, no API key needed |
| Map | ✅ Real geolocation, simulated patrol flight path, live distance/altitude stats |
| Analytics | ✅ Live-updating sparkline charts for 5 sensors |
| Swarm | ✅ Bee formation view — reflects bee count/formation chosen in Settings |
| Settings | ✅ Full settings list with 8 working detail screens |

A few things are intentionally simulated rather than wired to real hardware,
since there's no physical drone yet — flight telemetry (altitude, speed,
GPS path), sensor readings, and swarm bee status are all generated/animated
in the browser. The AI Assistant, Vision (object detection), and Mission/Map
(real location and mapping) are genuinely real, not simulated.

## Project structure

```
src/
  SplashScreen.jsx         <- BeeOS logo splash: bee flies in + neon text reveal
  MrBeeWelcome.jsx         <- landing screen (title, bee, Get Started / Sign In)
  ConnectBeeScreen.jsx     <- "connecting to your Bee" screen, before the dashboard
  AppShell.jsx             <- shared page background + card frame + bottom nav + hamburger
  BottomNav.jsx            <- 4 primary tabs (Home, Control, AI Assistant, Vision)
  SideMenu.jsx             <- hamburger slide-out menu for the other 5 tabs
  HomeContent.jsx          <- Home tab (360° drag-rotate bee, status whisper line)
  AssistantContent.jsx     <- AI Assistant tab (live Gemini voice chat)
  FlightControlContent.jsx <- Control tab (joystick/manual + camera pan)
  VisionContent.jsx        <- Vision tab (real object detection)
  MissionContent.jsx       <- Mission tab (waypoint planning on a real map)
  MapContent.jsx           <- Map tab (live geolocation + patrol simulation)
  AnalyticsContent.jsx     <- Analytics tab (live sensor sparklines)
  SwarmContent.jsx         <- Swarm tab (formation view)
  SettingsContent.jsx      <- Settings tab (list + 8 sub-screens)
  *SettingsScreen.jsx      <- individual settings detail screens
  SettingsSubScreen.jsx    <- shared layout/controls used by settings screens
  App.jsx                  <- top-level flow: Splash -> Welcome -> Connect -> AppShell + tabs
  index.css                <- shared responsive sizing + animations
```

## App launch flow

1. **Splash** — BeeOS logo, bee flies in rotating and settles center, then the
   neon "BeeOS" wordmark reveals
2. **Welcome** — Mr.Bee title, Get Started / Sign In
3. **Connect Your Bee** — a brief "searching → found → connected" sequence
   (simulated, since there's no real device to pair with yet); "Skip for now"
   is also available
4. **Dashboard** — the 4-tab bottom bar (Home, Control, AI Assistant, Vision)
   plus the hamburger menu (Mission, Map, Analytics, Swarm, Settings)

## Home screen — drag to rotate the bee

The bee on the Home tab responds to horizontal drag/swipe with a 3D Y-axis
spin (`rotateY`), like a product showcase — click/touch and drag left or
right. It's a CSS transform on a single image rather than a true 3D model, so
it's a flat "card spin" rather than seeing new geometry, but it reads well at
this size and needs no extra 3D library.

## How navigation works

`App.jsx` holds the shared state: which launch stage is showing (`stage`:
splash/welcome/connecting/app), which bottom-nav or menu tab is active
(`tab`), and two pieces of state shared across tabs — `language` (Voice
Commands settings ↔ AI Assistant) and `swarmConfig` (Swarm Settings ↔ Swarm
tab). Switching tabs swaps which content component renders inside
`AppShell`; the background, card frame, hamburger button, and nav bar stay
mounted throughout.

## Extending it further

Each tab is a self-contained component, so the natural next steps are things
like: wiring Control/Map telemetry to a real flight controller once hardware
exists, adding more object classes or a custom-trained model to Vision, or
persisting Mission waypoints and Settings across sessions (currently
everything resets on page reload since nothing is saved to storage yet).
