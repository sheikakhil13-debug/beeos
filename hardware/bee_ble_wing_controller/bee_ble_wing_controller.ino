/*
  bee_ble_wing_controller.ino
  ---------------------------------------------------------------------------
  Physical bee side of src/beeConnection.js — an ESP32 BLE peripheral that
  advertises a Nordic UART-style service, receives the 4-byte control frame
  the app writes over Web Bluetooth, and drives two wing servos to flap.

  This MUST match beeConnection.js exactly:
    SERVICE_UUID  = 6e400001-b5a3-f393-e0a9-e50e24dcca9e
    CHAR_UUID_RX  = 6e400002-b5a3-f393-e0a9-e50e24dcca9e  (write, write-no-response)

    Byte layout written by sendControl({throttle, yaw, pitch, roll}):
      byte[0] = throttle * 255            -> 0..255   (0..1 range)
      byte[1] = (yaw   + 1) * 127.5       -> 0..255   (-1..1 range, 127/128 = center)
      byte[2] = (pitch + 1) * 127.5
      byte[3] = (roll  + 1) * 127.5

  Board: any ESP32 dev board with BLE (plain ESP32 WROOM32 is fine).
  Library: uses the built-in "BLEDevice" (ESP32 BLE Arduino) that ships with
  the ESP32 board package in Arduino IDE — nothing extra to install.
  ---------------------------------------------------------------------------
*/

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <ESP32Servo.h>

#define SERVICE_UUID   "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHAR_UUID_RX   "6e400002-b5a3-f393-e0a9-e50e24dcca9e"

// ---- Servo pins -------------------------------------------------------
const int LEFT_WING_PIN  = 18;
const int RIGHT_WING_PIN = 19;
const int SERVO_MIN_US = 900;
const int SERVO_MAX_US = 2100;

Servo leftWing;
Servo rightWing;
BLEServer* pServer = nullptr;
bool deviceConnected = false;

// Decoded live control values (kept as floats, matching the JS -1..1 / 0..1 ranges)
float throttle = 0; // 0..1
float yaw = 0;      // -1..1  -> here used as roll: differential wing amplitude
float pitch = 0;    // -1..1  -> wing incidence / tail trim
float roll = 0;     // -1..1  -> reserved, unused by the 2-servo build below

unsigned long lastRxAt = 0;
const unsigned long RX_TIMEOUT_MS = 500; // fail-safe if the app goes quiet mid-flight

unsigned long lastFlapToggleAt = 0;
bool flapPhaseUp = false;

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* server) override {
    deviceConnected = true;
  }
  void onDisconnect(BLEServer* server) override {
    deviceConnected = false;
    throttle = yaw = pitch = roll = 0; // fail-safe: stop flapping immediately
    // Web Bluetooth centrals reconnect by calling requestDevice again, so
    // just restart advertising and wait.
    BLEDevice::startAdvertising();
  }
};

class RxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) override {
    std::string data = characteristic->getValue();
    if (data.length() < 4) return;

    uint8_t b0 = (uint8_t)data[0];
    uint8_t b1 = (uint8_t)data[1];
    uint8_t b2 = (uint8_t)data[2];
    uint8_t b3 = (uint8_t)data[3];

    throttle = b0 / 255.0f;
    yaw      = (b1 / 127.5f) - 1.0f;
    pitch    = (b2 / 127.5f) - 1.0f;
    roll     = (b3 / 127.5f) - 1.0f;

    lastRxAt = millis();
  }
};

void applyWings() {
  // throttle drives flap amplitude (lift), yaw drives differential
  // left/right amplitude (steer like the CTorque bionic butterfly does),
  // pitch trims both wings forward/back together.
  int baseAmp = (int)(throttle * 45);              // degrees of flap swing
  int leftAmp  = constrain(baseAmp - (int)(yaw * 20), 0, 60);
  int rightAmp = constrain(baseAmp + (int)(yaw * 20), 0, 60);
  int trim = (int)(pitch * 15);

  int center = 90; // servo horn resting angle
  int leftAngle  = flapPhaseUp ? center + leftAmp + trim  : center - leftAmp + trim;
  int rightAngle = flapPhaseUp ? center + rightAmp + trim : center - rightAmp + trim;

  leftWing.write(constrain(leftAngle, 0, 180));
  rightWing.write(constrain(rightAngle, 0, 180));
}

void setup() {
  Serial.begin(115200);

  leftWing.attach(LEFT_WING_PIN, SERVO_MIN_US, SERVO_MAX_US);
  rightWing.attach(RIGHT_WING_PIN, SERVO_MIN_US, SERVO_MAX_US);

  BLEDevice::init("BeeOS-01"); // shows up in the browser's pairing picker
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService* pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic* pRx = pService->createCharacteristic(
      CHAR_UUID_RX,
      BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
  pRx->setCallbacks(new RxCallbacks());

  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID); // required so the Web Bluetooth
                                               // services filter can find it
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BeeOS-01 advertising, waiting for phone...");
}

void loop() {
  // Fail-safe: if connected but no control frame recently, ease off instead
  // of holding the last command (covers app backgrounded, phone locked, etc).
  if (deviceConnected && millis() - lastRxAt > RX_TIMEOUT_MS) {
    throttle = max(0.0f, throttle - 0.05f);
  }
  if (!deviceConnected) {
    throttle = yaw = pitch = roll = 0;
  }

  unsigned long now = millis();
  int flapPeriodMs = throttle > 0 ? (int)map(throttle * 100, 1, 100, 250, 40) : 500;
  if (now - lastFlapToggleAt >= (unsigned long)flapPeriodMs) {
    flapPhaseUp = !flapPhaseUp;
    lastFlapToggleAt = now;
    applyWings();
  }
}
