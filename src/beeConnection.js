// src/beeConnection.js
// Shared Web Bluetooth connection to the physical Bee (ESP32 flight bridge).
// Both ConnectBeeScreen and FlightControlContent import this so they share
// one live connection instead of each managing their own.

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_UUID_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

let device = null;
let characteristic = null;
let beeName = null;
const listeners = new Set();

function notify(state) {
  listeners.forEach((cb) => cb(state));
}

export function isSupported() {
  return typeof navigator !== "undefined" && !!navigator.bluetooth;
}

export function isConnected() {
  return !!characteristic;
}

export function getBeeName() {
  return beeName;
}

// Subscribe to "connected" / "disconnected" events. Returns an unsubscribe fn.
export function onConnectionChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// MUST be called from a direct user gesture (button onClick), otherwise the
// browser will silently reject the request — this is a Web Bluetooth rule,
// not something we can work around from code.
export async function connectToBee() {
  if (!isSupported()) {
    throw new Error("Web Bluetooth isn't supported in this browser. Use Chrome on Android.");
  }

  device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  });

  device.addEventListener("gattserverdisconnected", () => {
    characteristic = null;
    notify("disconnected");
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  characteristic = await service.getCharacteristic(CHAR_UUID_RX);
  beeName = device.name || "Bee";

  notify("connected");
  return beeName;
}

export function disconnectFromBee() {
  device?.gatt?.disconnect();
  characteristic = null;
  notify("disconnected");
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function clampSigned(v) {
  return Math.max(-1, Math.min(1, v));
}

// throttle: 0..1   yaw/pitch/roll: -1..1
export function sendControl({ throttle = 0, yaw = 0, pitch = 0, roll = 0 }) {
  if (!characteristic) return;

  const bytes = new Uint8Array([
    Math.round(clamp01(throttle) * 255),
    Math.round((clampSigned(yaw) + 1) * 127.5),
    Math.round((clampSigned(pitch) + 1) * 127.5),
    Math.round((clampSigned(roll) + 1) * 127.5),
  ]);

  characteristic.writeValueWithoutResponse(bytes).catch((err) => {
    console.warn("BeeOS BLE write failed:", err);
  });
}
