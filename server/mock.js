let timer = null;
const status = {
  connected: true,
  mode: "mock",
  path: null,
  sensor: null,
  led: "off",
  updatedAt: null
};

const simulateSensor = () => {
  const wave = Math.sin(Date.now() / 1500);
  status.sensor = Math.round(512 + wave * 450);
  status.updatedAt = new Date().toISOString();
};

export const startMock = () => {
  simulateSensor();
  timer = setInterval(simulateSensor, 500);
  console.log("Mock Arduino gestart: sensor en led zijn beschikbaar.");
};

export const getMockStatus = () => ({ ...status });

export const setMockLed = (state) => {
  status.led = state;
};

export const stopMock = () => {
  if (timer) clearInterval(timer);
};
