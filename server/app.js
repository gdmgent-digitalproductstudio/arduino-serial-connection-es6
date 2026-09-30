import path from "node:path";
import { fileURLToPath } from "node:url";
import { ReadlineParser } from "@serialport/parser-readline";
import express from "express";
import { SerialPort } from "serialport";

const app = express();
const httpPort = Number(process.env.PORT ?? 3000);
const baudRate = Number(process.env.SERIAL_BAUD_RATE ?? 9600);
const serialPath = process.env.SERIAL_PATH ?? process.argv[2] ?? "COM3";
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(currentDirectory, "../client");

let latestSensor = null;
let updatedAt = null;

const arduinoPort = new SerialPort({ path: serialPath, baudRate });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (line) => {
  const cleanLine = line.trim();
  if (!cleanLine.startsWith("sensor:")) return;

  const value = Number.parseInt(cleanLine.slice("sensor:".length), 10);
  if (Number.isFinite(value)) {
    latestSensor = value;
    updatedAt = new Date().toISOString();
  }
});

arduinoPort.on("open", () => {
  console.log(`Arduino verbonden via ${serialPath}`);
});

arduinoPort.on("error", (error) => {
  console.error(`Seriële fout: ${error.message}`);
});

app.use(express.json());
app.use(express.static(clientDirectory));

app.get("/api/sensor", (_request, response) => {
  response.json({ sensor: latestSensor, updatedAt });
});

app.post("/api/led", (request, response) => {
  const { state } = request.body;

  if (state !== "on" && state !== "off") {
    return response.status(400).json({
      status: "error",
      message: "Gebruik state 'on' of 'off'."
    });
  }

  if (!arduinoPort.isOpen) {
    return response.status(503).json({
      status: "error",
      message: "Arduino is niet verbonden."
    });
  }

  arduinoPort.write(state === "on" ? "led_on\n" : "led_off\n");
  return response.json({ status: "ok", led: state });
});

app.listen(httpPort, () => {
  console.log(`Webinterface actief op http://localhost:${httpPort}`);
});
