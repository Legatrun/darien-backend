const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    spaceId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    placeId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Denormalized field for easier querying of reservations by site'
    },
    clientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    reservationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'Reservations'
  });

  return Reservation;
};
