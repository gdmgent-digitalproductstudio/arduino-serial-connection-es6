// Serieel protocol: sensor:<waarde> van Arduino naar Node en led_on/off terug.
const byte LED_PIN = LED_BUILTIN;
const byte SENSOR_PIN = A0;
const unsigned long SENSOR_INTERVAL = 500;

unsigned long previousSensorRead = 0;

void setup() {
  // Start met de ingebouwde LED uit en stem de baudrate af op de Node-server.
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(9600);
  Serial.setTimeout(50);
}

void loop() {
  const unsigned long now = millis();

  // Gebruik millis() zodat sensormetingen de seriële commandoverdracht niet blokkeren.
  if (now - previousSensorRead >= SENSOR_INTERVAL) {
    previousSensorRead = now;
    const int sensorValue = analogRead(SENSOR_PIN);
    Serial.print("sensor:");
    Serial.println(sensorValue);
  }

  if (Serial.available() > 0) {
    // Lees één volledig commando per regel en wijzig alleen de ingebouwde LED.
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "led_on") {
      digitalWrite(LED_PIN, HIGH);
    } else if (command == "led_off") {
      digitalWrite(LED_PIN, LOW);
    }
  }
}
