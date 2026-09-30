import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

export class SerialDevice {
  constructor({ path, baudRate }) {
    this.path = path;
    this.baudRate = baudRate;
    this.port = null;
    this.status = {
      connected: false,
      mode: "serial",
      path,
      sensor: null,
      led: "off",
      updatedAt: null
    };
  }

  start() {
    this.port = new SerialPort({ path: this.path, baudRate: this.baudRate });
    const parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", (line) => {
      const cleanLine = line.trim();
      if (!cleanLine.startsWith("sensor:")) return;

      const value = Number.parseInt(cleanLine.slice("sensor:".length), 10);
      if (Number.isFinite(value)) this.updateSensor(value);
    });

    this.port.on("open", () => {
      this.status.connected = true;
      console.log(`Arduino verbonden via ${this.path}`);
    });

    this.port.on("close", () => {
      this.status.connected = false;
    });

    this.port.on("error", (error) => {
      this.status.connected = false;
      console.error(`Seriële fout: ${error.message}`);
    });
  }

  updateSensor(value) {
    this.status.sensor = value;
    this.status.updatedAt = new Date().toISOString();
  }

  getStatus() {
    return { ...this.status };
  }

  setLed(state) {
    if (!this.port?.isOpen) throw new Error("Arduino is niet verbonden.");

    this.port.write(state === "on" ? "led_on\n" : "led_off\n");
    this.status.led = state;
  }

  stop() {
    if (this.port?.isOpen) this.port.close();
  }
}
