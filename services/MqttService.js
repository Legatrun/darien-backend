const mqtt = require('mqtt');
const { TelemetryAggregations, DeviceReported, DeviceDesired } = require('../models');
const AlertService = require('./AlertService');
const WebSocketService = require('./WebSocketService');

class MqttService {
  constructor() {
    this.client = null;
  }

  connect() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribe();
    });

    this.client.on('message', (topic, message) => {
      console.log('📨 MQTT Message received on:', topic);
      this.handleMessage(topic, message);
    });
  }

  subscribe() {
    this.client.subscribe('sites/+/offices/+/telemetry');
    this.client.subscribe('sites/+/offices/+/reported');
  }

  async handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      const parts = topic.split('/');
      const spaceId = parts[3];

      if (topic.endsWith('/telemetry')) {
        await this.handleTelemetry(spaceId, payload);
        console.log("🔵 Llego TELEMETRY MQTT:", spaceId, payload);
      } else if (topic.endsWith('/reported')) {
        await this.handleReported(officeId, payload);
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  async handleTelemetry(spaceId, payload) {
    try {
      console.log("🟢 Enviando TELEMETRY WS:", spaceId, payload);
      WebSocketService.emitTelemetry(spaceId, {
        ...payload,
        timestamp: new Date()
      });

      const aggregation = await TelemetryAggregations.create({
        spaceId,
        ts: new Date(),
        temp_c: payload.temp_c,
        humidity_pct: payload.humidity_pct,
        co2_ppm: payload.co2_ppm,
        occupancy: payload.occupancy,
        power_w: payload.power_w
      });
      console.log("💾 Telemetry saved to DB:", aggregation.id);

      await AlertService.processTelemetry(spaceId, aggregation);
    } catch (error) {
      console.error("❌ Error processing telemetry:", error.message);
    }
  }

  async handleReported(spaceId, payload) {
    const reported = await DeviceReported.upsert({
      spaceId,
      samplingIntervalSec: payload.samplingIntervalSec,
      co2_alert_threshold: payload.co2_alert_threshold,
      firmwareVersion: payload.firmwareVersion
    });

    WebSocketService.emitReportedState(spaceId, reported[0]);
  }

  publishDesired(spaceId, config) {
    if (!this.client) return;
  
  }
  
  async publishDesiredConfig(spaceId, config) {
      const { Space, Place } = require('../models');
      const space = await Space.findByPk(spaceId, { include: { model: Place, as: 'place' } });
      if (!space || !space.place) {
          console.error('Could not find site for space', spaceId);
          return;
      }
      
      const topic = `sites/${space.place.id}/offices/${spaceId}/desired`;
      this.client.publish(topic, JSON.stringify(config));
  }
}

module.exports = new MqttService();
