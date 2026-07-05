import React, { useState, useRef, useCallback, useEffect } from "react";
import { sendControl, isConnected, onConnectionChange } from "./beeConnection";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function FlightControlContent() {
  const [mode, setMode] = useState("manual"); // manual | joystick
  const [flightState, setFlightState] = useState("landed"); // landed | taking-off | in-flight | landing
  const [altitude, setAltitude] = useState(0);
  const [verticalPos, setVerticalPos] = useState(50); // 0-100, slider position
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 }); // -1 to 1
  const [pressedDir, setPressedDir] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // camera pan, px
  const [activeDirs, setActiveDirs] = useState(new Set()); // held manual-mode directions

  const [beeLinked, setBeeLinked] = useState(isConnected());

  const padRef = useRef(null);
  const dragging = useRef(false);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const stickPosRef = useRef({ x: 0, y: 0 });
  const activeDirsRef = useRef(new Set());
  const altitudeRef = useRef(0);
  const verticalPosRef = useRef(50);
  const flightStateRef = useRef("landed");

  // Keep the live connection pill in sync with the shared BLE module
  useEffect(() => {
    return onConnectionChange((state) => setBeeLinked(state === "connected"));
  }, []);

  useEffect(() => {
    altitudeRef.current = altitude;
  }, [altitude]);
  useEffect(() => {
    verticalPosRef.current = verticalPos;
  }, [verticalPos]);
  useEffect(() => {
    flightStateRef.current = flightState;
  }, [flightState]);

  // Real control loop: streams throttle/yaw/pitch/roll to the Bee over BLE
  // at ~25Hz whenever the drone isn't landed. Values come from whichever
  // input (joystick drag or manual d-pad) is active, plus the altitude slider.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected()) return;
      const fs = flightStateRef.current;
      if (fs === "landed") return;

      const throttle = fs === "taking-off" ? altitudeRef.current / 15 : verticalPosRef.current / 100;

      let yaw = 0;
      let pitch = 0;
      if (mode === "joystick") {
        yaw = stickPosRef.current.x;
        pitch = -stickPosRef.current.y; // stick up (negative y) = pitch forward
      } else {
        if (activeDirsRef.current.has("left")) yaw -= 1;
        if (activeDirsRef.current.has("right")) yaw += 1;
        if (activeDirsRef.current.has("up")) pitch += 1;
        if (activeDirsRef.current.has("down")) pitch -= 1;
      }

      sendControl({ throttle, yaw, pitch, roll: 0 });
    }, 40);

    return () => clearInterval(interval);
  }, [mode]);

  // Continuous pan loop — moves the camera while a direction is held (manual)
  // or while the joystick is pushed off-center (joystick mode)
  useEffect(() => {
    let raf;
    const PAN_SPEED = 2.4; // px per frame at full deflection
    const PAN_LIMIT = 60; // px, how far the background can shift

    const tick = () => {
      let dx = 0;
      let dy = 0;

      if (mode === "joystick") {
        dx = stickPosRef.current.x;
        dy = stickPosRef.current.y;
      } else {
        if (activeDirsRef.current.has("left")) dx -= 1;
        if (activeDirsRef.current.has("right")) dx += 1;
        if (activeDirsRef.current.has("up")) dy -= 1;
        if (activeDirsRef.current.has("down")) dy += 1;
      }

      if (dx !== 0 || dy !== 0) {
        const next = {
          x: clamp(panOffsetRef.current.x + dx * PAN_SPEED, -PAN_LIMIT, PAN_LIMIT),
          y: clamp(panOffsetRef.current.y + dy * PAN_SPEED, -PAN_LIMIT, PAN_LIMIT),
        };
        panOffsetRef.current = next;
        setPanOffset(next);
      } else if (panOffsetRef.current.x !== 0 || panOffsetRef.current.y !== 0) {
        // drift back toward center when no input
        const next = {
          x: panOffsetRef.current.x * 0.9,
          y: panOffsetRef.current.y * 0.9,
        };
        if (Math.abs(next.x) < 0.3) next.x = 0;
        if (Math.abs(next.y) < 0.3) next.y = 0;
        panOffsetRef.current = next;
        setPanOffset(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    stickPosRef.current = stickPos;
  }, [stickPos]);

  useEffect(() => {
    activeDirsRef.current = activeDirs;
  }, [activeDirs]);

  const takeOff = () => {
    if (flightState !== "landed") return;
    if (!isConnected()) return; // safety: no real link, no real flight
    setFlightState("taking-off");
    let h = 0;
    const t = setInterval(() => {
      h += 1;
      setAltitude(h);
      if (h >= 15) {
        clearInterval(t);
        setFlightState("in-flight");
      }
    }, 80);
  };

  const land = () => {
    if (flightState !== "in-flight") return;
    setFlightState("landing");
    let h = altitude;
    const t = setInterval(() => {
      h -= 1;
      setAltitude(Math.max(0, h));
      if (h <= 0) {
        clearInterval(t);
        setFlightState("landed");
        setStickPos({ x: 0, y: 0 });
        sendControl({ throttle: 0, yaw: 0, pitch: 0, roll: 0 });
      }
    }, 60);
  };

  const hover = () => {
    if (flightState === "in-flight") setStickPos({ x: 0, y: 0 });
  };

  const emergencyStop = () => {
    setFlightState("landed");
    setAltitude(0);
    setStickPos({ x: 0, y: 0 });
    sendControl({ throttle: 0, yaw: 0, pitch: 0, roll: 0 });
  };

  const startDir = (dir) => {
    if (flightState !== "in-flight") return;
    setPressedDir(dir);
    setActiveDirs((prev) => new Set(prev).add(dir));
  };
  const stopDir = (dir) => {
    setPressedDir((p) => (p === dir ? null : p));
    setActiveDirs((prev) => {
      const next = new Set(prev);
      next.delete(dir);
      return next;
    });
  };

  // Joystick drag handling — grab the knob directly, drag freely in any direction.
  // Math is done in raw pixels relative to the pad's center, so it works the
  // same regardless of how big the pad renders on screen.
  const KNOB_TRAVEL_RATIO = 0.34; // how far the knob can travel, as a fraction of pad radius
  const knobTravel = (padRef.current?.getBoundingClientRect().width || 200) * KNOB_TRAVEL_RATIO;

  const updateStickFromEvent = useCallback((clientX, clientY) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    let dx = (clientX - cx) / radius;
    let dy = (clientY - cy) / radius;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }
    setStickPos({ x: dx, y: dy });
  }, []);

  const onKnobPointerDown = (e) => {
    if (flightState !== "in-flight") return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateStickFromEvent(e.clientX, e.clientY);
  };
  const onKnobPointerMove = (e) => {
    if (!dragging.current) return;
    updateStickFromEvent(e.clientX, e.clientY);
  };
  const onKnobPointerUp = (e) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* already released */
    }
    setStickPos({ x: 0, y: 0 });
  };

  const statusInfo = {
    landed: { label: "Landed", color: "#7d8390" },
    "taking-off": { label: "Taking off...", color: "#F2B544" },
    "in-flight": { label: "In flight", color: "#3ED598" },
    landing: { label: "Landing...", color: "#F2B544" },
  }[flightState];

  return (
    <div
      style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
          paddingLeft: "46px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Flight Control</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <StatusPill
            label={beeLinked ? "Bee Linked" : "No Bee Linked"}
            color={beeLinked ? "#3ED598" : "#F0615A"}
          />
          <StatusPill label={statusInfo.label} color={statusInfo.color} />
        </div>
      </div>

      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          background: "#0d1014",
          border: "1px solid #1c2027",
          borderRadius: "12px",
          padding: "4px",
          marginBottom: "20px",
        }}
      >
        <ModeButton active={mode === "manual"} onClick={() => setMode("manual")}>
          Manual
        </ModeButton>
        <ModeButton active={mode === "joystick"} onClick={() => setMode("joystick")}>
          Joystick
        </ModeButton>
      </div>

      {/* Live camera preview, pans with controls */}
      <div
        style={{
          position: "relative",
          height: "clamp(120px, 20vw, 180px)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #1f242c",
          marginBottom: "20px",
          background: "#0d1014",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-15%",
            width: "130%",
            height: "130%",
            background:
              "linear-gradient(180deg, #7fb6dd 0%, #a9c98f 45%, #5c7a44 100%)",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 60px), linear-gradient(180deg, #7fb6dd 0%, #a9c98f 45%, #5c7a44 100%)",
            transform: `translate(${-panOffset.x}px, ${-panOffset.y}px)`,
            transition: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        {/* HUD center crosshair */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "18px",
            height: "18px",
            transform: "translate(-50%, -50%)",
            border: "1.5px solid rgba(242,181,68,0.7)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "12px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: flightState === "in-flight" ? "#F0615A" : "#5a606b",
            }}
          />
          <span style={{ fontSize: "10px", color: "#cfd3da", fontWeight: 600 }}>
            {flightState === "in-flight" ? "LIVE" : "STANDBY"}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "12px",
            fontSize: "10px",
            color: "#cfd3da",
          }}
        >
          {altitude}m
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "22px" }}>
        {/* Directional pad / joystick */}
        <div
          ref={padRef}
          style={{
            position: "relative",
            width: "clamp(170px, 36vw, 230px)",
            height: "clamp(170px, 36vw, 230px)",
            borderRadius: "50%",
            background: "#0d1014",
            border: "1px solid #1c2027",
            flexShrink: 0,
            touchAction: "none",
            opacity: flightState === "in-flight" ? 1 : 0.5,
          }}
        >
          {mode === "manual" ? (
            <>
              <DirButton dir="up" pressed={pressedDir === "up"} onStart={() => startDir("up")} onStop={() => stopDir("up")} />
              <DirButton dir="down" pressed={pressedDir === "down"} onStart={() => startDir("down")} onStop={() => stopDir("down")} />
              <DirButton dir="left" pressed={pressedDir === "left"} onStart={() => startDir("left")} onStop={() => stopDir("left")} />
              <DirButton dir="right" pressed={pressedDir === "right"} onStart={() => startDir("right")} onStop={() => stopDir("right")} />
              <div
                style={{
                  position: "absolute",
                  inset: "32%",
                  borderRadius: "50%",
                  background: "#14171d",
                  border: "1px solid #20242c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BeeMark size={26} />
              </div>
            </>
          ) : (
            <>
              {/* Joystick base rings */}
              <div style={{ position: "absolute", inset: "8%", borderRadius: "50%", border: "1px solid #1c2027", pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: "26%", borderRadius: "50%", border: "1px solid #1c2027", pointerEvents: "none" }} />
              {/* Stick knob — grab anywhere on it and drag freely in any direction */}
              <div
                onPointerDown={onKnobPointerDown}
                onPointerMove={onKnobPointerMove}
                onPointerUp={onKnobPointerUp}
                onPointerCancel={onKnobPointerUp}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "44px",
                  height: "44px",
                  marginTop: "-22px",
                  marginLeft: "-22px",
                  borderRadius: "50%",
                  background: "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
                  boxShadow: dragging.current
                    ? "0 2px 6px rgba(232,163,34,0.5)"
                    : "0 4px 12px rgba(232,163,34,0.4)",
                  cursor: flightState === "in-flight" ? "grab" : "default",
                  touchAction: "none",
                  transform: `translate(${stickPos.x * knobTravel}px, ${stickPos.y * knobTravel}px) scale(${dragging.current ? 1.08 : 1})`,
                  transition: dragging.current ? "none" : "transform 0.2s ease",
                }}
              />
            </>
          )}
        </div>

        {/* Vertical altitude slider */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "10px", color: "#6b7078" }}>UP</span>
          <input
            type="range"
            min="0"
            max="100"
            value={flightState === "in-flight" ? verticalPos : 50}
            onChange={(e) => flightState === "in-flight" && setVerticalPos(Number(e.target.value))}
            disabled={flightState !== "in-flight"}
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              width: "8px",
              height: "clamp(120px, 24vw, 160px)",
              accentColor: "#F2B544",
              cursor: flightState === "in-flight" ? "pointer" : "default",
            }}
          />
          <span style={{ fontSize: "10px", color: "#6b7078" }}>DOWN</span>
          <span style={{ fontSize: "11px", color: "#F2B544", fontWeight: 700, marginTop: "4px" }}>
            {altitude}m
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <ActionButton
          label="Take Off"
          icon={<UpArrowIcon />}
          color="#1f3d2a"
          textColor="#3ED598"
          onClick={takeOff}
          disabled={flightState !== "landed" || !beeLinked}
        />
        <ActionButton
          label="Land"
          icon={<DownArrowIcon />}
          color="#3d3320"
          textColor="#F2B544"
          onClick={land}
          disabled={flightState !== "in-flight"}
        />
        <ActionButton
          label="Hover"
          icon={<HoverIcon />}
          color="#1c2f3d"
          textColor="#5BB8F2"
          onClick={hover}
          disabled={flightState !== "in-flight"}
        />
        <ActionButton
          label="Return Home"
          icon={<HomeIconSmall />}
          color="#2a1f3d"
          textColor="#B98CF2"
          onClick={land}
          disabled={flightState !== "in-flight"}
        />
      </div>

      <button
        onClick={emergencyStop}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: "12px",
          border: "1px solid #3a1f1f",
          background: "#1a1011",
          color: "#F0615A",
          fontSize: "13.5px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <WarningIcon /> Emergency Stop
      </button>
    </div>
  );
}

function StatusPill({ label, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "#0d1014",
        border: "1px solid #1c2027",
        borderRadius: "20px",
        padding: "5px 12px",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span style={{ fontSize: "11.5px", color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px",
        borderRadius: "9px",
        border: "none",
        background: active ? "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)" : "transparent",
        color: active ? "#231503" : "#9aa0aa",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function DirButton({ dir, pressed, onStart, onStop }) {
  const positions = {
    up: { top: "10%", left: "50%", transform: "translate(-50%, 0)" },
    down: { bottom: "10%", left: "50%", transform: "translate(-50%, 0)" },
    left: { left: "10%", top: "50%", transform: "translate(0, -50%)" },
    right: { right: "10%", top: "50%", transform: "translate(0, -50%)" },
  };
  const rotations = { up: "0deg", down: "180deg", left: "-90deg", right: "90deg" };
  return (
    <button
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onStart();
      }}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      style={{
        position: "absolute",
        touchAction: "none",
        ...positions[dir],
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        border: "1px solid #20242c",
        background: pressed ? "rgba(242,181,68,0.25)" : "#14171d",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `rotate(${rotations[dir]})` }}
      >
        <path d="M12 5l-7 11h14L12 5z" fill={pressed ? "#F2B544" : "#9aa0aa"} />
      </svg>
    </button>
  );
}

function ActionButton({ label, icon, color, textColor, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "13px",
        borderRadius: "12px",
        border: "none",
        background: color,
        color: textColor,
        fontSize: "13px",
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function BeeMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="13" rx="6" ry="7" fill="#F2B544" />
      <path d="M6 11h12M6 14h12M6 17h10" stroke="#1a1306" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="6" r="3" fill="#F2B544" />
    </svg>
  );
}
function UpArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="#3ED598" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DownArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12l7 7 7-7" stroke="#F2B544" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HoverIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#5BB8F2" strokeWidth="2" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#5BB8F2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function HomeIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" stroke="#B98CF2" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 20h20L12 3z" stroke="#F0615A" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.01" stroke="#F0615A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
