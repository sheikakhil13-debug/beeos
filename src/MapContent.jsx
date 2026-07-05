import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const FALLBACK_CENTER = { lat: 16.5062, lng: 80.648 }; // Vijayawada, AP — used if geolocation is denied/unavailable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Generates a small looping offset so the bee appears to fly a patrol route
// around the home point — purely a visual simulation, not real telemetry.
function useSimulatedFlightPath(home, enabled) {
  const [trail, setTrail] = useState([]);
  const [current, setCurrent] = useState(null);
  const tRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled || !home) {
      setTrail([]);
      setCurrent(null);
      return;
    }

    const { lat: homeLat, lng: homeLng } = home;
    // Rough conversion: small lat/lng deltas to draw a ~60m patrol loop
    const RADIUS_DEG = 0.0006;

    const tick = () => {
      tRef.current += 0.006;
      const angle = tRef.current;
      const lat = homeLat + Math.sin(angle) * RADIUS_DEG;
      const lng = homeLng + Math.sin(angle * 2) * RADIUS_DEG * 0.6 + Math.cos(angle) * RADIUS_DEG * 0.3;
      const point = { lat, lng };

      setCurrent(point);
      setTrail((prev) => {
        const next = [...prev, point];
        return next.length > 400 ? next.slice(next.length - 400) : next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, home]);

  return { trail, current };
}

function haversineMeters(p1, p2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function trailDistance(trail) {
  let total = 0;
  for (let i = 1; i < trail.length; i++) {
    total += haversineMeters(trail[i - 1], trail[i]);
  }
  return total;
}

export default function MapContent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: "beeos-google-maps",
  });

  const [locStatus, setLocStatus] = useState("requesting"); // requesting | granted | denied | unsupported
  const [homePos, setHomePos] = useState(null);
  const [flightActive, setFlightActive] = useState(false);
  const [maxAltitude, setMaxAltitude] = useState(0);
  const mapRef = useRef(null);
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocStatus("unsupported");
      setHomePos(FALLBACK_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHomePos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("granted");
      },
      () => {
        setLocStatus("denied");
        setHomePos(FALLBACK_CENTER);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const { trail, current } = useSimulatedFlightPath(homePos, flightActive);

  useEffect(() => {
    if (flightActive) {
      const t = setInterval(() => {
        setMaxAltitude((m) => Math.max(m, Math.round(30 + Math.random() * 20)));
      }, 1500);
      return () => clearInterval(t);
    }
  }, [flightActive]);

  const distanceTravelled = trailDistance(trail);

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (homePos && !hasCenteredRef.current) {
        map.panTo(homePos);
        map.setZoom(17);
        hasCenteredRef.current = true;
      }
    },
    [homePos]
  );

  // Recenter once the very first time homePos resolves after the map is already mounted
  useEffect(() => {
    if (mapRef.current && homePos && !hasCenteredRef.current) {
      mapRef.current.panTo(homePos);
      mapRef.current.setZoom(17);
      hasCenteredRef.current = true;
    }
  }, [homePos]);

  // Custom bee + home markers — built as data-URI SVG icons so no extra
  // image assets are needed. google.maps.Size only exists once the script
  // has loaded, so these are memoized behind isLoaded.
  const beeIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30'>
      <circle cx='15' cy='15' r='13' fill='%23F2B544' stroke='%230a0c10' stroke-width='2'/>
      <text x='15' y='20' font-size='14' text-anchor='middle'>🐝</text>
    </svg>`;
    return {
      url: `data:image/svg+xml;utf8,${svg}`,
      scaledSize: new window.google.maps.Size(30, 30),
      anchor: new window.google.maps.Point(15, 15),
    };
  }, [isLoaded]);

  const homeIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#3ED598",
      fillOpacity: 1,
      strokeColor: "#0a0c10",
      strokeWeight: 2,
    };
  }, [isLoaded]);

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Live Map</span>
        <button
          onClick={() => setFlightActive((a) => !a)}
          disabled={!homePos}
          style={{
            fontSize: "11px",
            color: flightActive ? "#F0615A" : "#3ED598",
            background: "#14171d",
            border: "1px solid #20242c",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: homePos ? "pointer" : "default",
            fontWeight: 600,
          }}
        >
          {flightActive ? "Stop Patrol" : "Start Patrol"}
        </button>
      </div>

      {/* Map */}
      <div
        style={{
          position: "relative",
          height: "clamp(220px, 40vw, 300px)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #1f242c",
          marginBottom: "14px",
          background: "#0d1014",
        }}
      >
        {!homePos || !isLoaded ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "12.5px", color: "#7d8390", margin: 0 }}>
              {!isLoaded ? "Loading map..." : "Getting your location..."}
            </p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={homePos}
            zoom={17}
            mapTypeId="satellite"
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            <Marker position={homePos} icon={homeIcon} />
            {trail.length > 1 && (
              <Polyline path={trail} options={{ strokeColor: "#F2B544", strokeWeight: 3, strokeOpacity: 0.85 }} />
            )}
            {current && <Marker position={current} icon={beeIcon} />}
          </GoogleMap>
        )}

        {locStatus === "denied" && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              right: "8px",
              fontSize: "10px",
              color: "#cfd3da",
              background: "rgba(10,12,16,0.75)",
              padding: "6px 9px",
              borderRadius: "6px",
              zIndex: 10,
            }}
          >
            Location permission denied — showing a default location instead.
          </div>
        )}
      </div>

      {/* Stats card */}
      <div
        style={{
          background: "#0d1014",
          border: "1px solid #1c2027",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <StatRow
          icon={<PinIcon />}
          label="Current location"
          value={current ? `${current.lat.toFixed(4)}°, ${current.lng.toFixed(4)}°` : homePos ? `${homePos.lat.toFixed(4)}°, ${homePos.lng.toFixed(4)}°` : "—"}
        />
        <StatRow
          icon={<RouteIcon />}
          label="Distance travelled"
          value={`${distanceTravelled.toFixed(0)} m`}
        />
        <StatRow
          icon={<AltitudeIcon />}
          label="Max altitude"
          value={`${maxAltitude} m`}
        />
      </div>

      <div style={{ flex: 1 }} />

      <button
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
          color: "#231503",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onClick={() => setFlightActive(false)}
      >
        <HomeIconSmall /> Return Home
      </button>
    </div>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
        {icon}
        <span style={{ fontSize: "12.5px", color: "#9aa0aa" }}>{label}</span>
      </div>
      <span style={{ fontSize: "12.5px", color: "#EDEDED", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s7-7.4 7-13a7 7 0 10-14 0c0 5.6 7 13 7 13z" stroke="#F2B544" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="2.4" stroke="#F2B544" strokeWidth="1.4" />
    </svg>
  );
}
function RouteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="6" r="2" stroke="#5BB8F2" strokeWidth="1.5" />
      <circle cx="19" cy="18" r="2" stroke="#5BB8F2" strokeWidth="1.5" />
      <path d="M5 8c0 6 14 4 14 10" stroke="#5BB8F2" strokeWidth="1.4" strokeDasharray="3 3" />
    </svg>
  );
}
function AltitudeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 18l5-9 4 6 3-5 6 8" stroke="#3ED598" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function HomeIconSmall() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" stroke="#231503" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
