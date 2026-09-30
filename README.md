# Arduino Serial Connection - ES6

Een compacte voorbeeldstack waarin een Arduino, een Express-server en een browserinterface met elkaar communiceren. De code gebruikt gewone functies en ES6 imports/exports, zonder classes of ingewikkelde abstracties.

## Structuur

```text
arduino/hardware-sketch.ino  Arduino-code
server/app.js                Express-routes en configuratie
server/serial.js             Alleen de echte seriële verbinding
server/mock.js               Simulatie van sensor en led
server/list-ports.js         Overzicht van seriële apparaten
client/index.html            Semantische interface met Pico CSS
client/js/api.js             API-functies met exports
client/js/main.js            Interfacegedrag met imports
client/css/styles.css        Kleine 90s-stijllaag
```

## Installeren

Vereisten: Node.js 20 of nieuwer en npm.

```bash
npm install
```

## Met een Arduino starten

1. Upload `arduino/hardware-sketch.ino` naar de Arduino.
2. Sluit de Serial Monitor in de Arduino IDE.
3. Zoek het pad van de aangesloten Arduino:

```bash
npm run ports
```

4. Start de server met dat pad:

```bash
npm start -- COM3
```

Op macOS of Linux ziet dat er bijvoorbeeld zo uit:

```bash
npm start -- /dev/cu.usbmodem1101
```

5. Open <http://localhost:3000>.

Je kunt de poort ook instellen via `SERIAL_PATH` in de omgeving.

## Zonder Arduino testen

```bash
npm run mock
```

De mock simuleert de wisselende waarde van sensor A0 en onthoudt de toestand van de led. Daardoor kun je de volledige interface en API testen zonder hardware.

## API

- `GET /api/status` geeft verbinding, modus, poort, sensor en led terug.
- `GET /api/sensor` geeft alleen de sensormeting terug.
- `POST /api/led` met `{ "state": "on" }` of `{ "state": "off" }` bedient de led.

## ES6-modules

- De serverbestanden gebruiken `import` en `export`.
- `client/js/api.js` exporteert `getStatus()` en `setLed()`.
- `client/js/main.js` importeert die functies en koppelt ze aan de interface.
- `package.json` bevat `"type": "module"`.
