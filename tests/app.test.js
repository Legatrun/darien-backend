const request = require('supertest');
const app = require('../app');
const { sequelize, Reserva, Espacio, Lugar } = require('../models');
const ReservaService = require('../services/ReservaService');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('ReservaService Unit Tests', () => {
  test('checkConflict should return false when no conflict', async () => {
    const conflict = await ReservaService.checkConflict('some-uuid', '2023-01-01', '10:00', '11:00');
    expect(conflict).toBe(false);
  });
});

describe('Integration Tests', () => {
  let espacioId;
  let lugarId;

  test('POST /api/espacios should create a new office', async () => {
    // First create a Lugar
    const lugar = await Lugar.create({ nombre: 'Test Site', ubicacion: { lat: 0, lng: 0 } });
    lugarId = lugar.id;

    const res = await request(app)
      .post('/api/espacios')
      .set('X-API-Key', 'secret-api-key-123')
      .send({
        lugarId: lugar.id,
        nombre: 'Office 101',
        capacidad: 5
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    espacioId = res.body.id;
  });

  test('POST /api/reservas should create a reservation', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('X-API-Key', 'secret-api-key-123')
      .send({
        espacioId,
        lugarId,
        emailCliente: 'test@example.com',
        fechaDeReserva: '2023-10-27',
        horaInicio: '10:00',
        horaFin: '11:00'
      });

    expect(res.statusCode).toEqual(201);
  });

  test('POST /api/reservas should fail on conflict', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('X-API-Key', 'secret-api-key-123')
      .send({
        espacioId,
        lugarId,
        emailCliente: 'other@example.com',
        fechaDeReserva: '2023-10-27',
        horaInicio: '10:30', // Overlap
        horaFin: '11:30'
      });

    expect(res.statusCode).toEqual(409);
  });
});
