import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/prisma';

beforeEach(async () => {
  await prisma.appointment.deleteMany();
  await prisma.clinician.deleteMany();
  await prisma.patient.deleteMany();
});

function iso(offsetMs: number) {
  return new Date(Date.now() + offsetMs).toISOString();
}

describe('GET /api/v1/appointments (admin)', () => {
  it('returns upcoming appointments', async () => {
    const s = iso(60 * 60 * 1000);
    const e = iso(2 * 60 * 60 * 1000);

    await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: 'c1',
        patientId: 'p1',
        start: s,
        end: e,
      });

    const res = await request(app)
      .get('/api/v1/appointments')
      .set('X-Role', 'admin');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('supports pagination', async () => {
    const s1 = iso(60 * 60 * 1000);
    const e1 = iso(2 * 60 * 60 * 1000);

    const s2 = iso(3 * 60 * 60 * 1000);
    const e2 = iso(4 * 60 * 60 * 1000);

    await request(app).post('/api/v1/appointments').set('X-Role', 'patient').send({
      clinicianId: 'c1',
      patientId: 'p1',
      start: s1,
      end: e1,
    });

    await request(app).post('/api/v1/appointments').set('X-Role', 'patient').send({
      clinicianId: 'c1',
      patientId: 'p2',
      start: s2,
      end: e2,
    });

    const res = await request(app)
      .get('/api/v1/appointments?limit=1')
      .set('X-Role', 'admin');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('validates pagination params', async () => {
    const res = await request(app)
      .get('/api/v1/appointments?limit=nan')
      .set('X-Role', 'admin');

    expect(res.status).toBe(400);
  });

  it('enforces admin role', async () => {
    const res = await request(app)
      .get('/api/v1/appointments')
      .set('X-Role', 'patient');

    expect(res.status).toBe(403);
  });
});