const { Reservation, Space } = require('../models');
const ReservationService = require('../services/ReservationService');

class ReservationController {
  static async create(req, res, next) {
    try {
      const { spaceId, reservationDate, startTime, endTime, clientEmail } = req.body;

      const hasConflict = await ReservationService.checkConflict(spaceId, reservationDate, startTime, endTime);
      if (hasConflict) {
        return res.status(409).json({ message: 'Reservation conflict: Time slot overlap' });
      }

      const limitReached = await ReservationService.checkWeeklyLimit(clientEmail, reservationDate);
      if (limitReached) {
        return res.status(429).json({ message: 'Weekly reservation limit reached for this client' });
      }

      const reservation = await Reservation.create(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);

      const { count, rows } = await Reservation.findAndCountAll({
        limit,
        offset,
        include: ['space', 'place']
      });

      res.json({
        total: count,
        page: parseInt(page),
        pageSize: limit,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const reservation = await Reservation.findByPk(req.params.id, { include: ['space', 'place'] });
      if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const [updated] = await Reservation.update(req.body, { where: { id: req.params.id } });
      if (!updated) return res.status(404).json({ message: 'Reservation not found' });
      const reservation = await Reservation.findByPk(req.params.id);
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const deleted = await Reservation.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ message: 'Reservation not found' });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReservationController;
