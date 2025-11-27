const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../sequelize.config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const { Place, Space, Reservation, DeviceDesired, DeviceReported, TelemetryAggregations, Alerts } = db;

Place.hasMany(Space, { foreignKey: 'placeId', as: 'spaces' });
Space.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

Space.hasMany(Reservation, { foreignKey: 'spaceId', as: 'reservations' });
Reservation.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

Place.hasMany(Reservation, { foreignKey: 'placeId', as: 'reservations' });
Reservation.belongsTo(Place, { foreignKey: 'placeId', as: 'place' });

Space.hasOne(DeviceDesired, { foreignKey: 'spaceId', as: 'desired' });
DeviceDesired.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

Space.hasOne(DeviceReported, { foreignKey: 'spaceId', as: 'reported' });
DeviceReported.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

Space.hasMany(TelemetryAggregations, { foreignKey: 'spaceId', as: 'telemetry' });
TelemetryAggregations.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

Space.hasMany(Alerts, { foreignKey: 'spaceId', as: 'alerts' });
Alerts.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
