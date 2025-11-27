const { Reservation, Space, Sequelize } = require('../models');
const { Op } = Sequelize;

class ReservationService {
  static async checkConflict(spaceId, date, startTime, endTime) {
    const existing = await Reservation.findOne({
      where: {
        spaceId,
        reservationDate: date,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } }
            ]
          }
        ],
      }
    });

    if (existing) {
      const count = await Reservation.count({
        where: {
          spaceId,
          reservationDate: date,
          startTime: { [Op.lt]: endTime },
          endTime: { [Op.gt]: startTime }
        }
      });
      return count > 0;
    }
    return false;
  }

  
  static async checkWeeklyLimit(clientEmail, date) {
    const d = new Date(date);
    const day = d.getDay(); 
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const startOfWeek = new Date(d.setDate(diff));
    const endOfWeek = new Date(d.setDate(diff + 6));

    const count = await Reservation.count({
      where: {
        clientEmail,
        reservationDate: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      }
    });

    return count >= 3;
  }
}

module.exports = ReservationService;
