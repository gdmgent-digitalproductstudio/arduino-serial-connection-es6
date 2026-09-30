import { getStatus, setLed } from "./api.js";

// Koppel vaste HTML-elementen aan de gegevens uit de serverstatus.
const connection = document.querySelector("#connection");
const mode = document.querySelector("#mode");
const port = document.querySelector("#port");
const sensorValue = document.querySelector("#sensor-value");
const sensorMeter = document.querySelector("#sensor-meter");
const sensorTimestamp = document.querySelector("#sensor-timestamp");
const ledState = document.querySelector("#led-state");
const feedback = document.querySelector("#feedback");
const ledButtons = document.querySelectorAll("[data-led-state]");

const renderStatus = (status) => {
  // Houd presentatie en device-logica gescheiden: deze functie werkt alleen de DOM bij.
  connection.textContent = status.connected ? "verbonden" : "niet verbonden";
  mode.textContent = status.mode === "mock" ? "mock" : "Arduino";
  port.textContent = status.path ?? "niet van toepassing";
  sensorValue.textContent = Number.isFinite(status.sensor) ? status.sensor : "—";
  sensorMeter.value = Number.isFinite(status.sensor) ? status.sensor : 0;
  sensorTimestamp.textContent = status.updatedAt
    ? `Laatste update: ${new Date(status.updatedAt).toLocaleTimeString("nl-BE")}`
    : "Nog geen meting ontvangen";
  ledState.textContent = status.led === "on" ? "aan" : "uit";
};

const refreshStatus = async () => {
  try {
    renderStatus(await getStatus());
  } catch (error) {
    // Toon netwerk- en API-fouten in dezelfde live feedback als LED-acties.
    connection.textContent = "server niet bereikbaar";
    feedback.textContent = error.message;
  }
};

ledButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    // De knopwaarde correspondeert met het state-veld van POST /api/led.
    const state = button.dataset.ledState;

    try {
      await setLed(state);
      feedback.textContent = `Led is ${state === "on" ? "aangezet" : "uitgezet"}.`;
      await refreshStatus();
    } catch (error) {
      feedback.textContent = error.message;
    }
  });
});

await refreshStatus();
// Poll de status zodat verbinding en sensormeting vanzelf actueel blijven.
setInterval(refreshStatus, 1000);
