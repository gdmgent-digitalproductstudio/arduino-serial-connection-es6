import { SerialPort } from "serialport";

const ports = await SerialPort.list();

if (ports.length === 0) {
  console.log("Geen seriële apparaten gevonden.");
  process.exit(0);
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
