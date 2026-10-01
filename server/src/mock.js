export class MockDevice {
  constructor() {
    this.timer = null;
    // De mock houdt hetzelfde statusformaat aan als SerialDevice.
    this.status = {
      connected: true,
      mode: "mock",
      path: null,
      sensor: null,
      led: "off",
      updatedAt: null
    };
  }

  start() {
    this.simulateSensor();
    // Ververs de simulatie tweemaal per seconde, net als de Arduino-sketch.
    this.timer = setInterval(() => this.simulateSensor(), 500);
    console.log("Mock Arduino gestart: sensor en led zijn beschikbaar.");
  }

  simulateSensor() {
    // Een sinusgolf geeft een vloeiend veranderende waarde binnen het A0-bereik.
    const wave = Math.sin(Date.now() / 1500);
    this.status.sensor = Math.round(512 + wave * 450);
    this.status.updatedAt = new Date().toISOString();
  }

  getStatus() {
    // Houd het interne statusobject privé voor de API-caller.
    return { ...this.status };
  }

  setLed(state) {
    this.status.led = state;
  }

  stop() {
    // Ruim de periodieke timer op wanneer de server afsluit.
    if (this.timer) clearInterval(this.timer);
  }
}
