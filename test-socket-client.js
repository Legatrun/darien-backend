const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';
const SPACE_ID = 'test-space';

const socket = io(SERVER_URL);

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server with ID:', socket.id);

  console.log(`📍 Subscribing to space: ${SPACE_ID}`);
  socket.emit('subscribe:space', SPACE_ID);
});

socket.on('telemetry:update', (data) => {
  console.log('🔔 Received telemetry:update:', data);
});

socket.on('telemetry:all', (data) => {
  console.log('📢 Received telemetry:all:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection Error:', err.message);
});
