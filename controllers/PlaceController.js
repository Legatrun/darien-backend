const { Place } = require('../models');

class PlaceController {
  static async create(req, res, next) {
    try {
      const place = await Place.create(req.body);
      res.status(201).json(place);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const places = await Place.findAll();
      res.json(places);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PlaceController;
