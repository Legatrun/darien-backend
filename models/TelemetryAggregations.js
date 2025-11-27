const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TelemetryAggregations = sequelize.define('TelemetryAggregations', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    spaceId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ts: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    temp_c: DataTypes.FLOAT,
    humidity_pct: DataTypes.FLOAT,
    co2_ppm: DataTypes.INTEGER,
    occupancy: DataTypes.INTEGER,
    power_w: DataTypes.FLOAT
  }, {
    tableName: 'TelemetryAggregations',
    indexes: [
      {
        fields: ['spaceId', 'ts']
      }
    ]
  });

  return TelemetryAggregations;
};
