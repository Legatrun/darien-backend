const { Server } = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
  }

  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`✅ WebSocket client connected: ${socket.id}`);

      socket.on('subscribe:space', (spaceId) => {
        socket.join(`space:${spaceId}`);
        console.log(`📍 Client ${socket.id} subscribed to space ${spaceId}`);
      });

      socket.on('unsubscribe:space', (spaceId) => {
        socket.leave(`space:${spaceId}`);
        console.log(`📍 Client ${socket.id} unsubscribed from space ${spaceId}`);
      });

      socket.on('disconnect', () => {
        console.log(`❌ WebSocket client disconnected: ${socket.id}`);
      });
    });

    console.log('WebSocket server initialized');
  }

  emitTelemetry(spaceId, telemetry) {
    if (!this.io) return;
    
    this.io.to(`space:${spaceId}`).emit('telemetry:update', {
      spaceId,
      telemetry,
      timestamp: new Date()
    });

    this.io.emit('telemetry:all', {
      spaceId,
      telemetry,
      timestamp: new Date()
    });
  }

  emitReportedState(spaceId, reported) {
    if (!this.io) return;
    
    this.io.to(`space:${spaceId}`).emit('reported:update', {
      spaceId,
      reported,
      timestamp: new Date()
    });

    this.io.emit('reported:all', {
      spaceId,
      reported,
      timestamp: new Date()
    });
  }

  emitAlert(spaceId, alert) {
    if (!this.io) return;
    
    this.io.to(`space:${spaceId}`).emit('alert:new', {
      spaceId,
      alert,
      timestamp: new Date()
    });

    this.io.emit('alert:all', {
      spaceId,
      alert,
      timestamp: new Date()
    });
  }
}

module.exports = new WebSocketService();
