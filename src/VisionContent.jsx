import React, { useState, useRef, useEffect, useCallback } from "react";

// Maps COCO-SSD class names to colors used for bounding boxes / labels
const CLASS_COLORS = {
  person: "#F0615A",
  car: "#5BB8F2",
  truck: "#5BB8F2",
  bus: "#5BB8F2",
  bicycle: "#5BB8F2",
  motorcycle: "#5BB8F2",
  dog: "#3ED598",
  cat: "#3ED598",
  bird: "#3ED598",
  horse: "#3ED598",
};
const DEFAULT_COLOR = "#F2B544";

function colorFor(className) {
  return CLASS_COLORS[className] || DEFAULT_COLOR;
}

export default function VisionContent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | loading-model | requesting-camera | running | error
  const [errorMsg, setErrorMsg] = useState("");
  const [detections, setDetections] = useState([]);
  const [recording, setRecording] = useState(false);
  const [fps, setFps] = useState(0);

  const startVision = useCallback(async () => {
    setErrorMsg("");
    try {
      setPhase("loading-model");
      if (!modelRef.current) {
        const [tf, cocoSsd] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/coco-ssd"),
        ]);
        await tf.ready();
        modelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      }

      setPhase("requesting-camera");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPhase("running");
      runDetectionLoop();
    } catch (err) {
      setPhase("error");
      if (err && err.name === "NotAllowedError") {
        setErrorMsg("Camera permission was denied. Allow camera access and try again.");
      } else if (err && err.name === "NotFoundError") {
        setErrorMsg("No camera was found on this device.");
      } else {
        setErrorMsg("Couldn't start the camera or load the detection model.");
      }
    }
  }, []);

  const stopVision = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPhase("idle");
    setDetections([]);
    setRecording(false);
  }, []);

  useEffect(() => {
    return () => stopVision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runDetectionLoop() {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const loop = async () => {
      const video = videoRef.current;
      const model = modelRef.current;
      if (!video || !model || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const preds = await model.detect(video);
      setDetections(preds);
      drawBoxes(preds);

      frameCount += 1;
      const now = performance.now();
      if (now - fpsTimer > 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }

  function drawBoxes(preds) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    preds.forEach((pred) => {
      const [x, y, w, h] = pred.bbox;
      const color = colorFor(pred.class);

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, canvas.width / 280);
      ctx.strokeRect(x, y, w, h);

      const label = `${pred.class} ${Math.round(pred.score * 100)}%`;
      ctx.font = `${Math.max(12, canvas.width / 45)}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const pad = 4;
      const labelH = Math.max(16, canvas.width / 35);

      ctx.fillStyle = color;
      ctx.fillRect(x, Math.max(0, y - labelH), textWidth + pad * 2, labelH);

      ctx.fillStyle = "#0a0c10";
      ctx.fillText(label, x + pad, Math.max(labelH - 4, y - 5));
    });
  }

  const countByClass = detections.reduce((acc, d) => {
    acc[d.class] = (acc[d.class] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          paddingLeft: "46px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700 }}>Live AI Vision</span>
        {phase === "running" && (
          <span style={{ fontSize: "11px", color: "#6b7078" }}>{fps} fps</span>
        )}
      </div>

      {/* Camera viewport */}
      <div
        style={{
          position: "relative",
          height: "clamp(220px, 42vw, 320px)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #1f242c",
          background: "#0d1014",
          marginBottom: "14px",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: phase === "running" ? "block" : "none",
            transform: "scaleX(-1)",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: phase === "running" ? "block" : "none",
            transform: "scaleX(-1)",
          }}
        />

        {phase !== "running" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            {phase === "idle" && (
              <>
                <EyeIcon />
                <button
                  onClick={startVision}
                  style={{
                    padding: "11px 22px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
                    color: "#231503",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Start Live Vision
                </button>
                <p style={{ fontSize: "11px", color: "#6b7078", margin: 0, maxWidth: "240px" }}>
                  Uses your device camera with real object detection running in the browser.
                </p>
              </>
            )}
            {(phase === "loading-model" || phase === "requesting-camera") && (
              <>
                <Spinner />
                <p style={{ fontSize: "12.5px", color: "#9aa0aa", margin: 0 }}>
                  {phase === "loading-model"
                    ? "Loading detection model..."
                    : "Requesting camera access..."}
                </p>
              </>
            )}
            {phase === "error" && (
              <>
                <WarningIcon />
                <p style={{ fontSize: "12.5px", color: "#F0615A", margin: 0, maxWidth: "240px" }}>
                  {errorMsg}
                </p>
                <button
                  onClick={startVision}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "10px",
                    border: "1px solid #20242c",
                    background: "#14171d",
                    color: "#EDEDED",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Try again
                </button>
              </>
            )}
          </div>
        )}

        {phase === "running" && (
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
                background: recording ? "#F0615A" : "#5a606b",
              }}
            />
            <span style={{ fontSize: "10px", color: "#cfd3da", fontWeight: 600 }}>
              {recording ? "REC" : "LIVE"}
            </span>
          </div>
        )}
      </div>

      {/* Detections list */}
      <div style={{ flex: 1, marginBottom: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#6b7078",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          AI Detections
        </p>
        {Object.keys(countByClass).length === 0 ? (
          <p style={{ fontSize: "12.5px", color: "#5a606b", margin: 0 }}>
            {phase === "running" ? "Nothing detected right now." : "Start live vision to see detections."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(countByClass).map(([cls, count]) => (
              <div
                key={cls}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#0d1014",
                  border: "1px solid #1c2027",
                  borderRadius: "12px",
                  padding: "10px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "2px",
                      background: colorFor(cls),
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "#cfd3da", textTransform: "capitalize" }}>
                    {cls} detected
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#6b7078" }}>×{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => phase === "running" && setRecording((r) => !r)}
          disabled={phase !== "running"}
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "12px",
            border: "1px solid #1f242c",
            background: "#14171d",
            color: phase === "running" ? "#EDEDED" : "#5a606b",
            fontSize: "13px",
            fontWeight: 600,
            cursor: phase === "running" ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CameraIcon /> Snapshot
        </button>
        <button
          onClick={() => (phase === "running" ? stopVision() : startVision())}
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            background:
              phase === "running"
                ? "linear-gradient(180deg, #F0615A 0%, #C73E38 100%)"
                : "linear-gradient(180deg, #F8C45B 0%, #E8A322 100%)",
            color: phase === "running" ? "#fff" : "#231503",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <RecordIcon /> {phase === "running" ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="#F2B544" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" stroke="#F2B544" strokeWidth="1.6" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 20h20L12 3z" stroke="#F0615A" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.01" stroke="#F0615A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="#cfd3da" strokeWidth="1.6" />
      <path d="M8 7l1.5-3h5L16 7" stroke="#cfd3da" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" stroke="#cfd3da" strokeWidth="1.4" />
    </svg>
  );
}
function RecordIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
    </svg>
  );
}
function Spinner() {
  return (
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        border: "3px solid #20242c",
        borderTopColor: "#F2B544",
        animation: "mrbee-spin 0.8s linear infinite",
      }}
    />
  );
}
