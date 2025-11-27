const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceDesired = sequelize.define('DeviceDesired', {
    spaceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    samplingIntervalSec: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    co2_alert_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    }
  }, {
    tableName: 'DeviceDesired',
    timestamps: true
  });

  return DeviceDesired;
};
