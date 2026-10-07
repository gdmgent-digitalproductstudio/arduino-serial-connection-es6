import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { SerialPort } from "serialport";

const terminal = createInterface({ input: stdin, output: stdout });

const arduino = new SerialPort({
  path: process.env.SERIAL_PATH,
  baudRate: 9600
});

arduino.on("open", async () => {
  console.log("Verbonden met Arduino.");

  while (true) {
    const keuze = await terminal.question(
      "\n1. LED aan\n2. LED uit\n3. Stoppen\n> "
    );

    if (keuze === "1") {
      arduino.write("led_on\n");
    } else if (keuze === "2") {
      arduino.write("led_off\n");
    } else if (keuze === "3") {
      break;
    } else {
      console.log("Kies 1, 2 of 3.");
    }
  }

  terminal.close();
  arduino.close();
});

arduino.on("error", (error) => {
  console.error(error.message);
});