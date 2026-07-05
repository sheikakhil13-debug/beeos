import React, { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [16.5062, 80.648]; // Vijayawada, AP — change if you like

// Custom colored circular markers (Leaflet's default marker icon needs
// bundler-specific asset handling, so we build our own with divIcon instead)
function makeIcon(label, color) {
  return L.divIcon({
    className: "mrbee-waypoint-icon",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 2px solid #0a0c10;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #0a0c10;
      font-family: Inter, sans-serif;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function ClickToAddWaypoint({ onAdd }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MissionContent() {
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

  const path = waypoints.map((w) => [w.lat, w.lng]);

  const tileUrl =
    tileStyle === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution =
    tileStyle === "satellite"
      ? "Tiles &copy; Esri"
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={15}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
        >
          <TileLayer url={tileUrl} attribution={tileAttribution} />
          <ClickToAddWaypoint onAdd={addWaypoint} />

          {path.length > 1 && (
            <Polyline positions={path} pathOptions={{ color: "#F2B544", weight: 3, opacity: 0.9, dashArray: "8 6" }} />
          )}

          {waypoints.map((wp, i) => (
            <Marker
              key={wp.id}
              position={[wp.lat, wp.lng]}
              icon={makeIcon(i === 0 ? "H" : String(i), i === 0 ? "#3ED598" : "#F2B544")}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  updateWaypointPos(wp.id, lat, lng);
                },
                click: () => removeWaypoint(wp.id),
              }}
            />
          ))}
        </MapContainer>

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
            zIndex: 1000,
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
