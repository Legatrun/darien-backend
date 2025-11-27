const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alerts = sequelize.define('Alerts', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    spaceId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    kind: {
      type: DataTypes.ENUM('CO2', 'OCCUPANCY_MAX', 'OCCUPANCY_UNEXPECTED'),
      allowNull: false
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    meta_json: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'Alerts'
  });

  return Alerts;
};
