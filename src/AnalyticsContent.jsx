import React, { useState, useEffect, useRef } from "react";

const HISTORY_LENGTH = 30;

const SENSORS = [
  {
    id: "battery",
    label: "Battery",
    unit: "%",
    color: "#3ED598",
    icon: BatteryIcon,
    initial: 92,
    range: [0, 100],
    step: () => -0.05 - Math.random() * 0.05, // slowly drains
  },
  {
    id: "temperature",
    label: "Temperature",
    unit: "°C",
    color: "#F0615A",
    icon: TempIcon,
    initial: 32,
    range: [20, 45],
    step: () => (Math.random() - 0.5) * 1.2,
  },
  {
    id: "altitude",
    label: "Altitude",
    unit: "m",
    color: "#5BB8F2",
    icon: AltitudeIcon,
    initial: 15,
    range: [0, 60],
    step: () => (Math.random() - 0.5) * 4,
  },
  {
    id: "airQuality",
    label: "Air Quality",
    unit: "",
    color: "#3ED598",
    icon: AirIcon,
    initial: 85,
    range: [0, 100],
    step: () => (Math.random() - 0.5) * 3,
    formatValue: (v) => qualityLabel(v),
  },
  {
    id: "obstacle",
    label: "Obstacle Distance",
    unit: "m",
    color: "#B98CF2",
    icon: ObstacleIcon,
    initial: 2.3,
    range: [0.3, 8],
    step: () => (Math.random() - 0.5) * 0.6,
    decimals: 1,
  },
];

function qualityLabel(v) {
  if (v >= 80) return "Good";
  if (v >= 50) return "Moderate";
  return "Poor";
}

function clamp(v, [min, max]) {
  return Math.max(min, Math.min(max, v));
}

export default function AnalyticsContent() {
  const [data, setData] = useState(() =>
    Object.fromEntries(
      SENSORS.map((s) => [s.id, Array.from({ length: HISTORY_LENGTH }, () => s.initial)])
    )
  );
  const valuesRef = useRef(
    Object.fromEntries(SENSORS.map((s) => [s.id, s.initial]))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setData((prev) => {
        const next = { ...prev };
        SENSORS.forEach((s) => {
          const newVal = clamp(valuesRef.current[s.id] + s.step(), s.range);
          valuesRef.current[s.id] = newVal;
          next[s.id] = [...prev[s.id].slice(1), newVal];
        });
        return next;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Sensor Analytics</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {SENSORS.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} history={data[sensor.id]} />
        ))}
      </div>
    </div>
  );
}

function SensorCard({ sensor, history }) {
  const current = history[history.length - 1];
  const decimals = sensor.decimals ?? 0;
  const displayValue = sensor.formatValue
    ? sensor.formatValue(current)
    : `${current.toFixed(decimals)}${sensor.unit}`;

  const Icon = sensor.icon;

  return (
    <div
      style={{
        background: "#0d1014",
        border: "1px solid #1c2027",
        borderRadius: "16px",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon color={sensor.color} />
          <span style={{ fontSize: "12.5px", color: "#9aa0aa", fontWeight: 500 }}>
            {sensor.label}
          </span>
        </div>
        <span style={{ fontSize: "14px", fontWeight: 700, color: sensor.color }}>
          {displayValue}
        </span>
      </div>

      <Sparkline data={history} color={sensor.color} range={sensor.range} />
    </div>
  );
}

function Sparkline({ data, color, range }) {
  const width = 100; // viewBox units, scales via CSS
  const height = 36;
  const [min, max] = range;
  const span = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / span) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gradientId = `sparkfill-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "44px", display: "block" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function BatteryIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="17" height="10" rx="2" stroke={color} strokeWidth="1.6" />
      <rect x="20" y="10" width="2" height="4" rx="1" fill={color} />
      <rect x="4.5" y="9.5" width="9" height="5" rx="1" fill={color} opacity="0.6" />
    </svg>
  );
}
function TempIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="10" y="3" width="4" height="12" rx="2" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="18" r="3.4" fill={color} />
    </svg>
  );
}
function AltitudeIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 18l5-9 4 6 3-5 6 8" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function AirIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 8h12a3 3 0 100-3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 12h15a3 3 0 110 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 16h9a3 3 0 110 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ObstacleIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill={color} />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
