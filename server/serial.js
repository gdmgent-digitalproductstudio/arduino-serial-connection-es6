import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

let port = null;
// Modulebrede status wordt gedeeld door de geëxporteerde devicefuncties.
const status = {
  connected: false,
  mode: "serial",
  path: null,
  sensor: null,
  led: "off",
  updatedAt: null
};

const updateSensor = (value) => {
  status.sensor = value;
  // ISO-tijd maakt de meting eenvoudig overdraagbaar via JSON.
  status.updatedAt = new Date().toISOString();
};

export const startSerial = ({ path, baudRate }) => {
  // Bewaar de gekozen poort zodat status en afsluiten dezelfde verbinding gebruiken.
  status.path = path;
  port = new SerialPort({ path, baudRate });
  // Arduino-regels eindigen op een newline; de parser geeft complete regels door.
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (line) => {
    // Andere seriële berichten zijn geen sensormetingen en worden genegeerd.
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

export const getSerialStatus = () => ({ ...status });

export const setSerialLed = (state) => {
  if (!port?.isOpen) throw new Error("Arduino is niet verbonden.");

  // Dit protocol wordt ook door hardware-sketch.ino verwerkt.
  port.write(state === "on" ? "led_on\n" : "led_off\n");
  status.led = state;
};

export const stopSerial = () => {
  // Een gesloten of nog niet geopende poort hoeft niet afgesloten te worden.
  if (port?.isOpen) port.close();
};
