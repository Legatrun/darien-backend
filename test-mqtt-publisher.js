const mqtt = require('mqtt');

const BROKER_URL = 'mqtt://localhost:1883';
const SITE_ID = 'test-site';
const SPACE_ID = 'test-space';
const TOPIC = `sites/${SITE_ID}/offices/${SPACE_ID}/telemetry`;

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  
  setInterval(() => {
    const payload = {
      temp_c: (20 + Math.random() * 5).toFixed(1),
      humidity_pct: (40 + Math.random() * 20).toFixed(1),
      co2_ppm: Math.floor(400 + Math.random() * 100),
      occupancy: Math.random() > 0.5 ? 1 : 0,
      power_w: Math.floor(Math.random() * 200)
    };

    console.log(`📤 Publishing to ${TOPIC}:`, payload);
    client.publish(TOPIC, JSON.stringify(payload));
  }, 5000);
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});
