const mqtt = require('mqtt');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const SITE_ID = process.argv[2] || 'test-site-id';
const SPACE_ID = process.argv[3] || 'test-space-id';

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  console.log(`📍 Site ID: ${SITE_ID}`);
  console.log(`📍 Space ID: ${SPACE_ID}`);
  
  const desiredTopic = `sites/${SITE_ID}/offices/${SPACE_ID}/desired`;
  client.subscribe(desiredTopic, (err) => {
    if (!err) {
      console.log(`📥 Subscribed to: ${desiredTopic}`);
    }
  });
  
  setInterval(() => {
    sendTelemetry();
  }, 5000);
  
  setTimeout(() => {
    sendReported();
  }, 1000);
});

client.on('message', (topic, message) => {
  console.log('\n🔔 Received desired config:');
  console.log(`Topic: ${topic}`);
  console.log(`Message: ${message.toString()}`);
  
  setTimeout(() => {
    console.log('✅ Configuration applied, sending reported state...');
    const config = JSON.parse(message.toString());
    sendReported(config);
  }, 1000);
});

function sendTelemetry() {
  const telemetryTopic = `sites/${SITE_ID}/offices/${SPACE_ID}/telemetry`;
  const telemetry = {
    temp_c: (20 + Math.random() * 5).toFixed(2),
    humidity_pct: (40 + Math.random() * 20).toFixed(2),
    co2_ppm: Math.floor(400 + Math.random() * 600),
    occupancy: Math.random() > 0.5,
    power_w: (100 + Math.random() * 100).toFixed(2)
  };
  
  client.publish(telemetryTopic, JSON.stringify(telemetry));
  console.log(`📤 Telemetry sent: CO2=${telemetry.co2_ppm}ppm, Temp=${telemetry.temp_c}°C`);
}

function sendReported(config = {}) {
  const reportedTopic = `sites/${SITE_ID}/offices/${SPACE_ID}/reported`;
  const reported = {
    samplingIntervalSec: config.samplingIntervalSec || 30,
    co2_alert_threshold: config.co2_alert_threshold || 800,
    firmwareVersion: '1.0.0'
  };
  
  client.publish(reportedTopic, JSON.stringify(reported));
  console.log(`📤 Reported state sent:`, reported);
}

client.on('error', (error) => {
  console.error('❌ MQTT Error:', error);
});

console.log('🚀 Starting MQTT device simulator...');
console.log('Usage: node test-mqtt-device.js <site-id> <space-id>');
console.log('Press Ctrl+C to stop\n');
