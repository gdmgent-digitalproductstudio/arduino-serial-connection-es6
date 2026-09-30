import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { getMockStatus, setMockLed, startMock, stopMock } from "./mock.js";
import {
  getSerialStatus,
  setSerialLed,
  startSerial,
  stopSerial
} from "./serial.js";

const app = express();
const httpPort = Number(process.env.PORT ?? 3000);
const baudRate = Number(process.env.SERIAL_BAUD_RATE ?? 9600);
const mock = process.argv.includes("--mock") || process.env.SERIAL_MOCK === "true";
const pathArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const serialPath = process.env.SERIAL_PATH ?? pathArgument ?? "COM3";
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(currentDirectory, "../client");

if (mock) {
  startMock();
} else {
  startSerial({ path: serialPath, baudRate });
}

const getStatus = () => (mock ? getMockStatus() : getSerialStatus());
const setLed = (state) => (mock ? setMockLed(state) : setSerialLed(state));

app.use(express.json());
app.use(express.static(clientDirectory));

app.get("/api/status", (_request, response) => {
  response.json(getStatus());
});

app.get("/api/sensor", (_request, response) => {
  const { sensor, updatedAt } = getStatus();
  response.json({ sensor, updatedAt });
});

app.post("/api/led", (request, response) => {
  const { state } = request.body;

  if (state !== "on" && state !== "off") {
    return response.status(400).json({
      status: "error",
      message: "Gebruik state 'on' of 'off'."
    });
  }

  try {
    setLed(state);
    return response.json({ status: "ok", led: state });
  } catch (error) {
    return response.status(503).json({
      status: "error",
      message: error.message
    });
  }
});

const server = app.listen(httpPort, () => {
  const mode = mock ? "mock" : `seriële poort ${serialPath}`;
  console.log(`Webinterface actief op http://localhost:${httpPort} (${mode})`);
});

const shutdown = () => {
  if (mock) stopMock();
  else stopSerial();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
