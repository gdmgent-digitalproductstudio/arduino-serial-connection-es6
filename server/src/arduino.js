import "dotenv/config";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

const ACTIES = {
  1: {
    naam: "LED aanzetten",
    commando: "led_on\n",
    bevestiging: "De LED is aangezet."
  },
  2: {
    naam: "LED uitzetten",
    commando: "led_off\n",
    bevestiging: "De LED is uitgezet."
  }
};

async function vraagActie() {
  const terminal = createInterface({ input, output });

  try {
    while (true) {
      console.log("\nWat wil je doen?");
      console.log(`1. ${ACTIES[1].naam}`);
      console.log(`2. ${ACTIES[2].naam}`);

      const keuze = (await terminal.question("Kies 1 of 2: ")).trim();

      if (ACTIES[keuze]) return ACTIES[keuze];
      console.log("Ongeldige keuze. Probeer opnieuw.");
    }
  } finally {
    terminal.close();
  }
}

function maakArduinoVerbinding() {
  const pad = process.env.SERIAL_PATH;
  const baudRate = Number(process.env.SERIAL_BAUD_RATE ?? 9600);

  if (!pad) throw new Error("SERIAL_PATH ontbreekt in .env.");
  if (!Number.isInteger(baudRate) || baudRate <= 0) {
    throw new Error("SERIAL_BAUD_RATE in .env is ongeldig.");
  }

  return new SerialPort({ path: pad, baudRate });
}

function sluitVerbinding(arduino) {
  if (arduino.isOpen) arduino.close();
}

function toonFout(arduino, error) {
  console.error(`Seriële fout: ${error.message}`);
  process.exitCode = 1;
  sluitVerbinding(arduino);
}

function verstuurCommando(arduino, actie) {
  arduino.write(actie.commando, (writeError) => {
    if (writeError) return toonFout(arduino, writeError);

    arduino.drain((drainError) => {
      if (drainError) return toonFout(arduino, drainError);

      console.log(actie.bevestiging);
      sluitVerbinding(arduino);
    });
  });
}

async function main() {
  try {
    const actie = await vraagActie();
    const arduino = maakArduinoVerbinding();
    const parser = arduino.pipe(new ReadlineParser({ delimiter: "\n" }));

    arduino.on("open", () => {
      console.log(`Verbonden met Arduino via ${arduino.path}.`);
    });

    arduino.on("error", (error) => toonFout(arduino, error));

    // De eerste meting geeft aan dat de Arduino klaar is na zijn reset.
    parser.once("data", () => verstuurCommando(arduino, actie));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

await main();
