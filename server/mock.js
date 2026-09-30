export class MockDevice {
  constructor() {
    this.timer = null;
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
    this.timer = setInterval(() => this.simulateSensor(), 500);
    console.log("Mock Arduino gestart: sensor en led zijn beschikbaar.");
  }

  simulateSensor() {
    const wave = Math.sin(Date.now() / 1500);
    this.status.sensor = Math.round(512 + wave * 450);
    this.status.updatedAt = new Date().toISOString();
  }

  getStatus() {
    return { ...this.status };
  }

  setLed(state) {
    this.status.led = state;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}
