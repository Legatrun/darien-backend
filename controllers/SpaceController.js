const { Space, DeviceDesired, DeviceReported, TelemetryAggregations, Alerts } = require('../models');
const MqttService = require('../services/MqttService');

class SpaceController {
  static async create(req, res, next) {
    try {
      const space = await Space.create(req.body);
      res.status(201).json(space);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const spaces = await Space.findAll({ 
        include: [
          'place',
          {
            association: 'reservations',
            separate: true,
            order: [['createdAt', 'DESC']],
            limit: 1
          }
        ]
      });
      
      const spacesWithReservationId = spaces.map(space => {
        const spaceData = space.toJSON();
        spaceData.reservationId = spaceData.reservations && spaceData.reservations.length > 0 
          ? spaceData.reservations[0].id 
          : null;
        delete spaceData.reservations;
        return spaceData;
      });
      
      res.json(spacesWithReservationId);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const space = await Space.findByPk(req.params.id, { include: 'place' });
      if (!space) return res.status(404).json({ message: 'Space not found' });
      res.json(space);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const [updated] = await Space.update(req.body, { where: { id: req.params.id } });
      if (!updated) return res.status(404).json({ message: 'Space not found' });
      const space = await Space.findByPk(req.params.id);
      res.json(space);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const deleted = await Space.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ message: 'Space not found' });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getAllStatuses(req, res, next) {
    try {
      const spaces = await Space.findAll({ include: 'place' });
      
      const statuses = await Promise.all(spaces.map(async (space) => {
        const desired = await DeviceDesired.findByPk(space.id);
        const reported = await DeviceReported.findByPk(space.id);
        const alerts = await Alerts.findAll({ where: { spaceId: space.id, resolved_at: null } });
        const latestTelemetry = await TelemetryAggregations.findOne({
          where: { spaceId: space.id },
          order: [['ts', 'DESC']]
        });

        return {
          space: space.toJSON(),
          desired,
          reported,
          alerts,
          latestTelemetry,
          divergence: {
            samplingInterval: desired?.samplingIntervalSec !== reported?.samplingIntervalSec,
            co2Threshold: desired?.co2_alert_threshold !== reported?.co2_alert_threshold
          }
        };
      }));

      res.json(statuses);
    } catch (error) {
      next(error);
    }
  }

  static async updateDesired(req, res, next) {
    try {
      const { samplingIntervalSec, co2_alert_threshold } = req.body;
      const spaceId = req.params.id;

      await DeviceDesired.upsert({
        spaceId,
        samplingIntervalSec,
        co2_alert_threshold
      });

      await MqttService.publishDesiredConfig(spaceId, { samplingIntervalSec, co2_alert_threshold });

      res.json({ message: 'Configuration updated and published' });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const spaceId = req.params.id;
      
      const desired = await DeviceDesired.findByPk(spaceId);
      const reported = await DeviceReported.findByPk(spaceId);
      const alerts = await Alerts.findAll({ where: { spaceId, resolved_at: null } });
      const latestTelemetry = await TelemetryAggregations.findOne({
        where: { spaceId },
        order: [['ts', 'DESC']]
      });

      res.json({
        desired,
        reported,
        alerts,
        latestTelemetry,
        divergence: {
           samplingInterval: desired?.samplingIntervalSec !== reported?.samplingIntervalSec,
           co2Threshold: desired?.co2_alert_threshold !== reported?.co2_alert_threshold
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SpaceController;
