let timer = null;
// De mock gebruikt hetzelfde statusformaat als de echte seriële verbinding.
const status = {
  connected: true,
  mode: "mock",
  path: null,
  sensor: null,
  led: "off",
  updatedAt: null
};

const simulateSensor = () => {
  // Een sinusgolf geeft een vloeiend veranderende waarde binnen het A0-bereik.
  const wave = Math.sin(Date.now() / 1500);
  status.sensor = Math.round(512 + wave * 450);
  status.updatedAt = new Date().toISOString();
};

export const startMock = () => {
  simulateSensor();
  // Ververs de simulatie tweemaal per seconde, net als de Arduino-sketch.
  timer = setInterval(simulateSensor, 500);
  console.log("Mock Arduino gestart: sensor en led zijn beschikbaar.");
};

export const getMockStatus = () => ({ ...status });

export const setMockLed = (state) => {
  status.led = state;
};

export const stopMock = () => {
  // Ruim de periodieke timer op wanneer de server afsluit.
  if (timer) clearInterval(timer);
};
