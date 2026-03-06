#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "San's";
const char* password = "123456789@s";
const char* serverUrl = "http://10.164.238.1:5000/api/esp32/moisture";

int sensorPin = 34;   
int sensorValue = 0;
const int ZONE_ID = 1; 
const int DRY_VALUE = 4095; 
const int WET_VALUE = 1500; 

void setup() {
  Serial.begin(115200);   
  delay(5000); // 5 SECOND DELAY - gives you time to open the Serial Monitor

  Serial.println("\n\n=== STARTING SETUP ===");

  Serial.println("1. Setting up WiFi...");
  WiFi.mode(WIFI_STA); // Explicitly set as Station mode
  WiFi.begin(ssid, password);

  Serial.println("2. Waiting for WiFi Connection...");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n3. WiFi CONNECTED!");
    Serial.print("   IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n3. WiFi FAILED - Could not connect.");
  }

  Serial.println("=== SETUP COMPLETE ===\n");
}

void loop() {
  Serial.println("--- LOOP START ---");
  
  sensorValue = analogRead(sensorPin);
  Serial.print("Raw Sensor: ");
  Serial.println(sensorValue);

  float moisturePercent = map(sensorValue, DRY_VALUE, WET_VALUE, 0, 100);
  if (moisturePercent < 0) moisturePercent = 0;
  if (moisturePercent > 100) moisturePercent = 100;
  
  Serial.print("Moisture %: ");
  Serial.println(moisturePercent);

  // ONLY try to send data if WiFi is actually connected
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Calling sendDataToServer()...");
    sendDataToServer(moisturePercent);
    Serial.println("Returned from sendDataToServer().");
  } else {
    Serial.println("Skipped Sending - No WiFi.");
  }

  Serial.println("--- LOOP END ---");
  delay(3000); 
}

void sendDataToServer(float moisture) {
  HTTPClient http;
  
  Serial.println("   -> Setting up HTTPClient...");
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = "{\"zone_id\": " + String(ZONE_ID) + ", \"moisture\": " + String(moisture) + "}";
  Serial.print("   -> Payload built: ");
  Serial.println(jsonPayload);

  Serial.println("   -> Sending POST request...");
  int httpResponseCode = http.POST(jsonPayload);

  Serial.print("   -> Response Code: ");
  Serial.println(httpResponseCode); 
  
  http.end();
}
