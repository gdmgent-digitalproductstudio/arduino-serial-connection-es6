# Arduino Serial Connection - ES6

Een compacte voorbeeldstack waarin een Arduino, een Express-server en een browserinterface met elkaar communiceren.

## Structuur

```text
arduino/hardware-sketch.ino  Arduino-code
server/app.js                Express + SerialPort
client/index.html            Interface
client/js/api.js             API-functies met exports
client/js/main.js            Interfacegedrag met imports
client/css/styles.css        Vormgeving
```

## Installeren

Vereisten: Node.js 20 of nieuwer, npm en een aangesloten Arduino.

```bash
npm install
```

## Starten

1. Upload `arduino/hardware-sketch.ino` naar de Arduino.
2. Sluit de Serial Monitor in de Arduino IDE.
3. Start de server met de seriële poort als argument:

```bash
npm start -- COM3
```

Op macOS of Linux:

```bash
npm start -- /dev/cu.usbserial-110
```

4. Open <http://localhost:3000>.

Je kunt de poort ook instellen via `SERIAL_PATH` in de omgeving.

## ES6-modules

- De server gebruikt `import` voor Express, SerialPort en Node-modules.
- `client/js/api.js` exporteert `getSensor()` en `setLed()`.
- `client/js/main.js` importeert die functies en koppelt ze aan de interface.
- `package.json` bevat `"type": "module"`.

## API

- `GET /api/sensor`
- `POST /api/led` met `{ "state": "on" }` of `{ "state": "off" }`
