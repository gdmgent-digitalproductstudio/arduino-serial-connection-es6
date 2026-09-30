import { SerialPort } from "serialport";

async function listPorts() {
  const ports = await SerialPort.list();

  if (ports.length === 0) {
    console.log("Geen seriële apparaten gevonden.");
    return;
  }

  console.table(
    ports.map(({ path, manufacturer, serialNumber, vendorId, productId }) => ({
      path,
      manufacturer: manufacturer ?? "—",
      serialNumber: serialNumber ?? "—",
      vendorId: vendorId ?? "—",
      productId: productId ?? "—"
    }))
  );

  console.log("Start daarna bijvoorbeeld met: npm start -- <pad>");
}

await listPorts();
