const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceReported = sequelize.define('DeviceReported', {
    spaceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    samplingIntervalSec: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    co2_alert_threshold: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    firmwareVersion: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'DeviceReported',
    timestamps: true
  });

  return DeviceReported;
};
