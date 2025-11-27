const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Place = sequelize.define('Place', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'Places'
  });

  return Place;
};
