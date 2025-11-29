require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authMiddleware = require('./middlewares/authMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const spacesRoutes = require('./routes/spaces');
const placesRoutes = require('./routes/places');
const reservationsRoutes = require('./routes/reservations');
const MqttService = require('./services/MqttService');
const WebSocketService = require('./services/WebSocketService');
const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use(authMiddleware);

app.use('/api/spaces', spacesRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/reservations', reservationsRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    // console.log(`Server running on port ${PORT}`);
    try {
      await sequelize.authenticate();
      console.log('Database connected');

      await sequelize.sync({ alter: true });

      WebSocketService.initialize(server);
      console.log('WebSocket initialized');

      MqttService.connect();

    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  });
}

module.exports = { app, server };
