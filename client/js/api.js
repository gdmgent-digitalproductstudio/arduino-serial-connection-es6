const getJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "De aanvraag is mislukt.");
  }

  return data;
};

export const getSensor = () => getJson("/api/sensor");

export const setLed = (state) =>
  getJson("/api/led", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state })
  });
