import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { MockDevice } from "./mock.js";
import { SerialDevice } from "./serial.js";

const app = express();
// Runtime-instellingen kunnen per machine worden overschreven via de omgeving of CLI.
const httpPort = Number(process.env.PORT ?? 3000);
const baudRate = Number(process.env.SERIAL_BAUD_RATE ?? 9600);
const mock = process.argv.includes("--mock") || process.env.SERIAL_MOCK === "true";
const pathArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const serialPath = process.env.SERIAL_PATH ?? pathArgument ?? "COM3";
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(currentDirectory, "../client");

// Beide device-implementaties bieden hetzelfde start/getStatus/setLed/stop-contract.
const device = mock
  ? new MockDevice()
  : new SerialDevice({ path: serialPath, baudRate });

device.start();

// Verwerk JSON-aanvragen en lever de browserbestanden uit client/.
app.use(express.json());
app.use(express.static(clientDirectory));

// De statusroute levert alle gegevens die de interface periodiek toont.
app.get("/api/status", (_request, response) => {
  response.json(device.getStatus());
});

// Sensorclients kunnen ook alleen de meting en het tijdstip opvragen.
app.get("/api/sensor", (_request, response) => {
  const { sensor, updatedAt } = device.getStatus();
  response.json({ sensor, updatedAt });
});

app.post("/api/led", (request, response) => {
  const { state } = request.body;

  // Valideer invoer voor het device aan te roepen; hardwarefouten worden 503.
  if (state !== "on" && state !== "off") {
    return response.status(400).json({
      status: "error",
      message: "Gebruik state 'on' of 'off'."
    });
  }

  try {
    device.setLed(state);
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

// Stop eerst de devicebron en sluit daarna de HTTP-server gecontroleerd af.
const shutdown = () => {
  device.stop();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
