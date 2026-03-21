import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/prisma';

beforeEach(async () => {
  await prisma.appointment.deleteMany();
  await prisma.clinician.deleteMany();
  await prisma.patient.deleteMany();
});

describe('POST /api/v1/appointments', () => {
  it('returns 400 for appointments in the past', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '1-clinician',
        patientId: '1-patient',
        start: '2026-03-18T10:00:00.000Z',
        end: '2026-03-18T11:00:00.000Z',
      });

    expect(res.status).toBe(400);
  });

  it('returns 400 when start === end', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '1-clinician',
        patientId: '1-patient',
        start: '2026-03-22T11:00:00.000Z',
        end: '2026-03-22T11:00:00.000Z',
      });

    expect(res.status).toBe(400);
  });

  it('returns 400 when start > end', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '1-clinician',
        patientId: '1-patient',
        start: '2026-03-22T12:00:00.000Z',
        end: '2026-03-22T11:00:00.000Z',
      });

    expect(res.status).toBe(400);
  });

  it('returns 403 for incorrect role', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'clinician')
      .send({
        clinicianId: '1-clinician',
        patientId: '1-patient',
        start: '2026-03-22T10:00:00.000Z',
        end: '2026-03-22T11:00:00.000Z',
      });

    expect(res.status).toBe(403);
  });

  it('returns 403 when role is missing', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .send({
        clinicianId: '1-clinician',
        patientId: '1-patient',
        start: '2026-03-22T10:00:00.000Z',
        end: '2026-03-22T11:00:00.000Z',
      });

    expect(res.status).toBe(403);
  });

  it('handles overlapping and non-overlapping appointments correctly', async () => {
    // First valid appointment
    await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '2-clinician',
        patientId: '1-patient',
        start: '2026-03-22T10:00:00.000Z',
        end: '2026-03-22T11:00:00.000Z',
      })
      .expect(201);

    // Non-overlapping second
    await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '2-clinician',
        patientId: '2-patient',
        start: '2026-03-22T12:00:00.000Z',
        end: '2026-03-22T13:00:00.000Z',
      })
      .expect(201);

    // Overlap case 1
    const overlap1 = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '2-clinician',
        patientId: '3-patient',
        start: '2026-03-22T10:59:59.000Z',
        end: '2026-03-22T11:59:59.000Z',
      });

    expect(overlap1.status).toBe(409);

    // Overlap case 2
    const overlap2 = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '2-clinician',
        patientId: '3-patient',
        start: '2026-03-22T10:59:59.000Z',
        end: '2026-03-22T12:00:01.000Z',
      });

    expect(overlap2.status).toBe(409);

    // Touching boundary (allowed)
    const touching = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '2-clinician',
        patientId: '3-patient',
        start: '2026-03-22T11:00:00.000Z',
        end: '2026-03-22T12:00:00.000Z',
      });

    expect(touching.status).toBe(201);
  });

  it('returns 400 for invalid ISO datetimes', async () => {
    const res1 = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '3-clinician',
        patientId: '3-patient',
        start: '2026-03-22T24:00:00.000Z',
        end: '2026-03-22T25:00:00.000Z',
      });

    const res2 = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: '3-clinician',
        patientId: '3-patient',
        start: '2026-03-22T10:00:00.000Z',
        end: '2026-13-22T11:00:00.000Z',
      });

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
  });

  it('returns 400 for missing or empty fields', async () => {
    const cases = [
      {
        clinicianId: '4-clinician',
        start: '2026-03-23T10:00:00.000Z',
        end: '2026-03-23T11:00:00.000Z',
      },
      {
        patientId: '4-patient',
        start: '2026-03-23T10:00:00.000Z',
        end: '2026-03-23T11:00:00.000Z',
      },
      {
        clinicianId: '',
        patientId: '4-patient',
        start: '2026-03-23T10:00:00.000Z',
        end: '2026-03-23T11:00:00.000Z',
      },
      {
        clinicianId: '4-clinician',
        patientId: '',
        start: '2026-03-23T10:00:00.000Z',
        end: '2026-03-23T11:00:00.000Z',
      },
      {},
    ];

    for (const payload of cases) {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('X-Role', 'patient')
        .send(payload);

      expect(res.status).toBe(400);
    }
  });
});