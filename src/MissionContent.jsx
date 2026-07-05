import React, { useState, useRef, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 16.5062, lng: 80.648 }; // Vijayawada, AP — change if you like
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

export default function MissionContent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: "beeos-google-maps",
  });

  const [tileStyle, setTileStyle] = useState("satellite"); // satellite | streets
  const [waypoints, setWaypoints] = useState([]); // {id, lat, lng}
  const [missionRunning, setMissionRunning] = useState(false);
  const nextId = useRef(1);

  const addWaypoint = (lat, lng) => {
    setWaypoints((prev) => [...prev, { id: nextId.current++, lat, lng }]);
  };

  const updateWaypointPos = (id, lat, lng) => {
    setWaypoints((prev) => prev.map((w) => (w.id === id ? { ...w, lat, lng } : w)));
  };

  const removeWaypoint = (id) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== id));
  };

  const clearAll = () => setWaypoints([]);

  const startMission = () => {
    if (waypoints.length === 0) return;
    setMissionRunning(true);
  };

  const path = waypoints.map((w) => ({ lat: w.lat, lng: w.lng }));

  const onMapClick = (e) => {
    addWaypoint(e.latLng.lat(), e.latLng.lng());
  };

  // Custom colored circular markers — built as data-URI SVG icons, same
  // approach as MapContent.jsx, memoized behind isLoaded since
  // google.maps.Size only exists once the script has finished loading.
  const makeIcon = useMemo(() => {
    if (!isLoaded) return () => undefined;
    return (label, color) => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'>
        <circle cx='14' cy='14' r='12' fill='${encodeURIComponent(color)}' stroke='%230a0c10' stroke-width='2'/>
        <text x='14' y='18' font-size='11' font-weight='700' text-anchor='middle' fill='%230a0c10'>${label}</text>
      </svg>`;
      return {
        url: `data:image/svg+xml;utf8,${svg}`,
        scaledSize: new window.google.maps.Size(28, 28),
        anchor: new window.google.maps.Point(14, 14),
      };
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
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Mission Planner</span>
        <button
          onClick={() => setTileStyle((t) => (t === "satellite" ? "streets" : "satellite"))}
          style={{
            fontSize: "11px",
            color: "#9aa0aa",
            background: "#14171d",
            border: "1px solid #20242c",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          {tileStyle === "satellite" ? "Map" : "Satellite"}
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
        {!isLoaded ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "12.5px", color: "#7d8390", margin: 0 }}>Loading map...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={DEFAULT_CENTER}
            zoom={15}
            mapTypeId={tileStyle === "satellite" ? "satellite" : "roadmap"}
            onClick={onMapClick}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {path.length > 1 && (
              <Polyline
                path={path}
                options={{ strokeColor: "#F2B544", strokeWeight: 3, strokeOpacity: 0.9 }}
              />
            )}

            {waypoints.map((wp, i) => (
              <Marker
                key={wp.id}
                position={{ lat: wp.lat, lng: wp.lng }}
                icon={makeIcon(i === 0 ? "H" : String(i), i === 0 ? "#3ED598" : "#F2B544")}
                draggable
                onDragEnd={(e) => updateWaypointPos(wp.id, e.latLng.lat(), e.latLng.lng())}
                onClick={() => removeWaypoint(wp.id)}
              />
            ))}
          </GoogleMap>
        )}

        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            fontSize: "10px",
            color: "#cfd3da",
            background: "rgba(10,12,16,0.7)",
            padding: "4px 8px",
            borderRadius: "6px",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          Tap map to add waypoint
        </div>
      </div>

      {/* Waypoints list */}
      <div style={{ flex: 1, marginBottom: "14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "#6b7078",
              textTransform: "uppercase",
            }}
          >
            Waypoints
          </span>
          {waypoints.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                fontSize: "11px",
                color: "#F0615A",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {waypoints.length === 0 ? (
          <p style={{ fontSize: "12.5px", color: "#5a606b", margin: 0 }}>
            No waypoints yet — tap the map to add one.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {waypoints.map((wp, i) => (
              <div
                key={wp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#0d1014",
                  border: "1px solid #1c2027",
                  borderRadius: "12px",
                  padding: "9px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: i === 0 ? "#3ED598" : "#F2B544",
                      color: "#0a0c10",
                      fontSize: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i === 0 ? "H" : i}
                  </span>
                  <span style={{ fontSize: "12.5px", color: "#cfd3da" }}>
                    {i === 0 ? "Home" : `Point ${i}`}
                    <span style={{ color: "#5a606b", marginLeft: "6px", fontSize: "10.5px" }}>
                      {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => removeWaypoint(wp.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5a606b",
                    cursor: "pointer",
                    fontSize: "13px",
                    padding: "2px 6px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => {}}
          disabled={waypoints.length === 0}
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "12px",
            border: "1px solid #1f242c",
            background: "#14171d",
            color: waypoints.length === 0 ? "#5a606b" : "#EDEDED",
            fontSize: "13px",
            fontWeight: 600,
            cursor: waypoints.length === 0 ? "default" : "pointer",
          }}
        >
          Save Mission
        </button>
        <button
          onClick={startMission}
          disabled={waypoints.length === 0}
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            background:
              waypoints.length === 0
                ? "#2a2d33"
                : "linear-gradient(180deg, #4ADE9A 0%, #2BAE74 100%)",
            color: waypoints.length === 0 ? "#5a606b" : "#06140d",
            fontSize: "13px",
            fontWeight: 700,
            cursor: waypoints.length === 0 ? "default" : "pointer",
          }}
        >
          {missionRunning ? "Mission Running..." : "Start Mission"}
        </button>
      </div>
    </div>
  );
}
