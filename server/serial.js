import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

let port = null;
let mockTimer = null;
let status = {
  connected: false,
  mode: "serial",
  path: null,
  sensor: null,
  led: "off",
  updatedAt: null
};

const updateSensor = (value) => {
  status.sensor = value;
  status.updatedAt = new Date().toISOString();
};

const startMock = () => {
  status = { ...status, connected: true, mode: "mock", path: null };

  const simulateSensor = () => {
    const wave = Math.sin(Date.now() / 1500);
    updateSensor(Math.round(512 + wave * 450));
  };

  simulateSensor();
  mockTimer = setInterval(simulateSensor, 500);
  console.log("Mock Arduino gestart: sensor en led zijn beschikbaar.");
};

const startHardware = ({ path, baudRate }) => {
  status = { ...status, mode: "serial", path };
  port = new SerialPort({ path, baudRate });
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (line) => {
    const cleanLine = line.trim();
    if (!cleanLine.startsWith("sensor:")) return;

    const value = Number.parseInt(cleanLine.slice("sensor:".length), 10);
    if (Number.isFinite(value)) updateSensor(value);
  });

  port.on("open", () => {
    status.connected = true;
    console.log(`Arduino verbonden via ${path}`);
  });

  port.on("close", () => {
    status.connected = false;
  });

  port.on("error", (error) => {
    status.connected = false;
    console.error(`Seriële fout: ${error.message}`);
  });
};

export const startSerial = ({ path, baudRate, mock = false }) => {
  if (mock) {
    startMock();
    return;
  }

  startHardware({ path, baudRate });
};

export const getStatus = () => ({ ...status });

export const setLed = (state) => {
  if (status.mode === "mock") {
    status.led = state;
    return;
  }

  if (!port?.isOpen) throw new Error("Arduino is niet verbonden.");

  port.write(state === "on" ? "led_on\n" : "led_off\n");
  status.led = state;
};

export const stopSerial = () => {
  if (mockTimer) clearInterval(mockTimer);
  if (port?.isOpen) port.close();
};
