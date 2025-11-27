const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Space = sequelize.define('Space', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    placeId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    office_hours_start: {
      type: DataTypes.STRING,
      defaultValue: '09:00'
    },
    office_hours_end: {
      type: DataTypes.STRING,
      defaultValue: '18:00'
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    }
  }, {
    tableName: 'Spaces'
  });

  return Space;
};
