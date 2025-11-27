const { Alerts, TelemetryAggregations, Space, DeviceDesired, Sequelize } = require('../models');
const { Op } = Sequelize;
const WebSocketService = require('./WebSocketService');

class AlertService {
  static async processTelemetry(spaceId, telemetry) {
    await this.checkCO2(spaceId, telemetry);
    await this.checkOccupancyMax(spaceId, telemetry);
    await this.checkOccupancyUnexpected(spaceId, telemetry);
  }

  static async checkCO2(spaceId, telemetry) {
    const desired = await DeviceDesired.findByPk(spaceId);
    const threshold = desired ? desired.co2_alert_threshold : 1000;

    const activeAlert = await Alerts.findOne({
      where: { spaceId, kind: 'CO2', resolved_at: null }
    });

    if (telemetry.co2_ppm > threshold) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentHighs = await TelemetryAggregations.count({
        where: {
          spaceId,
          ts: { [Op.gte]: fiveMinsAgo },
          co2_ppm: { [Op.lte]: threshold } 
        }
      });

      if (recentHighs === 0 && !activeAlert) {
         const oldestInWindow = await TelemetryAggregations.findOne({
            where: { spaceId, ts: { [Op.gte]: fiveMinsAgo } },
            order: [['ts', 'ASC']]
         });
         
         if (oldestInWindow && oldestInWindow.co2_ppm > threshold) {
             const alert = await Alerts.create({ spaceId, kind: 'CO2', started_at: new Date() });
             WebSocketService.emitAlert(spaceId, alert);
         }
      }
    } else if (activeAlert) {
      const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentLows = await TelemetryAggregations.count({
        where: {
          spaceId,
          ts: { [Op.gte]: twoMinsAgo },
          co2_ppm: { [Op.gt]: threshold }
        }
      });

      if (recentLows === 0) {
        activeAlert.resolved_at = new Date();
        await activeAlert.save();
      }
    }
  }

  static async checkOccupancyMax(spaceId, telemetry) {
    const space = await Space.findByPk(spaceId);
    if (!space) return;

    const capacity = space.capacity;
    const activeAlert = await Alerts.findOne({
      where: { spaceId, kind: 'OCCUPANCY_MAX', resolved_at: null }
    });

    if (telemetry.occupancy > capacity) {
      const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentHighs = await TelemetryAggregations.count({
        where: {
          spaceId,
          ts: { [Op.gte]: twoMinsAgo },
          occupancy: { [Op.lte]: capacity }
        }
      });

      if (recentHighs === 0 && !activeAlert) {
         const oldestInWindow = await TelemetryAggregations.findOne({
            where: { spaceId, ts: { [Op.gte]: twoMinsAgo } },
            order: [['ts', 'ASC']]
         });
         if (oldestInWindow && oldestInWindow.occupancy > capacity) {
            const alert = await Alerts.create({ spaceId, kind: 'OCCUPANCY_MAX', started_at: new Date() });
            WebSocketService.emitAlert(spaceId, alert);
         }
      }
    } else if (activeAlert) {
      const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);
      const recentLows = await TelemetryAggregations.count({
        where: {
          spaceId,
          ts: { [Op.gte]: oneMinAgo },
          occupancy: { [Op.gt]: capacity }
        }
      });

      if (recentLows === 0) {
        activeAlert.resolved_at = new Date();
        await activeAlert.save();
      }
    }
  }

  static async checkOccupancyUnexpected(spaceId, telemetry) {
    if (telemetry.occupancy <= 0) return;

    const space = await Space.findByPk(spaceId);
    if (!space) return;

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOccupancy = await TelemetryAggregations.count({
        where: {
          spaceId,
          ts: { [Op.gte]: tenMinsAgo },
          occupancy: { [Op.lte]: 0 }
        }
    });
    
    if (recentOccupancy > 0) return;

    const oldestInWindow = await TelemetryAggregations.findOne({
        where: { spaceId, ts: { [Op.gte]: tenMinsAgo } },
        order: [['ts', 'ASC']]
    });
    if (!oldestInWindow) return;

    const activeAlert = await Alerts.findOne({
      where: { spaceId, kind: 'OCCUPANCY_UNEXPECTED', resolved_at: null }
    });
    if (activeAlert) return;

      const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const isOutOfHours = currentTime < space.office_hours_start || currentTime > space.office_hours_end;

    if (isOutOfHours) {
      const alert = await Alerts.create({ spaceId, kind: 'OCCUPANCY_UNEXPECTED', started_at: new Date(), meta_json: { reason: 'Out of hours' } });
      WebSocketService.emitAlert(spaceId, alert);
      return;
    }

    const { Reservation } = require('../models');
    const activeReservation = await Reservation.findOne({
      where: {
        spaceId,
        reservationDate: now.toISOString().slice(0, 10),
        startTime: { [Op.lte]: currentTime },
        endTime: { [Op.gte]: currentTime }
      }
    });

    if (!activeReservation) {
      const alert = await Alerts.create({ spaceId, kind: 'OCCUPANCY_UNEXPECTED', started_at: new Date(), meta_json: { reason: 'No reservation' } });
      WebSocketService.emitAlert(spaceId, alert);
    }
  }
}

module.exports = AlertService;
