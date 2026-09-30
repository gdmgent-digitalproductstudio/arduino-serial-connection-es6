import { getSensor, setLed } from "./api.js";

const sensorValue = document.querySelector("#sensor-value");
const sensorMeter = document.querySelector("#sensor-meter");
const sensorTimestamp = document.querySelector("#sensor-timestamp");
const feedback = document.querySelector("#feedback");
const ledButtons = document.querySelectorAll("[data-led-state]");

const showSensor = ({ sensor, updatedAt }) => {
  const value = Number.isFinite(sensor) ? sensor : 0;
  sensorValue.textContent = Number.isFinite(sensor) ? sensor : "—";
  sensorMeter.value = value;
  sensorTimestamp.textContent = updatedAt
    ? `Laatste update: ${new Date(updatedAt).toLocaleTimeString("nl-BE")}`
    : "Nog geen meting ontvangen";
};

const refreshSensor = async () => {
  try {
    showSensor(await getSensor());
  } catch (error) {
    feedback.textContent = error.message;
  }
};

ledButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const state = button.dataset.ledState;

    try {
      await setLed(state);
      feedback.textContent = `Led is ${state === "on" ? "aangezet" : "uitgezet"}.`;
    } catch (error) {
      feedback.textContent = error.message;
    }
  });
});

await refreshSensor();
setInterval(refreshSensor, 1000);
