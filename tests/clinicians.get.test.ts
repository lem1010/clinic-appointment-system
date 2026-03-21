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

describe('GET /api/v1/clinicians/:id/appointments', () => {
  it('returns upcoming appointments (default behaviour)', async () => {
    const pastStart = iso(-10 * 60 * 1000);
    const pastEnd = iso(-9 * 60 * 1000);

    const futureStart = iso(60 * 60 * 1000);
    const futureEnd = iso(2 * 60 * 60 * 1000);

    // past appointment
    await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: 'c1',
        patientId: 'p1',
        start: pastStart,
        end: pastEnd,
      })
      .expect(400);

    // future appointment
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId: 'c1',
        patientId: 'p2',
        start: futureStart,
        end: futureEnd,
      })
      .expect(201);

    const getRes = await request(app)
      .get('/api/v1/clinicians/c1/appointments')
      .set('X-Role', 'clinician');

    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBe(1);
    expect(getRes.body[0].id).toBe(res.body.id);
  });

  it('filters using from and to (inclusive)', async () => {
    const s2 = iso(60 * 60 * 1000);
    const e2 = iso(2 * 60 * 60 * 1000);

    const s3 = iso(3 * 60 * 60 * 1000);
    const e3 = iso(4 * 60 * 60 * 1000);

    await request(app).post('/api/v1/appointments').set('X-Role', 'patient').send({
      clinicianId: 'c2',
      patientId: 'p2',
      start: s2,
      end: e2,
    });

    await request(app).post('/api/v1/appointments').set('X-Role', 'patient').send({
      clinicianId: 'c2',
      patientId: 'p3',
      start: s3,
      end: e3,
    });

    const res = await request(app)
      .get(`/api/v1/clinicians/c2/appointments?from=${s2}&to=${s3}`)
      .set('X-Role', 'clinician');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('returns empty array for out-of-range window', async () => {
    const from = iso(60 * 60 * 1000);
    const to = iso(2 * 60 * 60 * 1000);

    const res = await request(app)
      .get(`/api/v1/clinicians/c3/appointments?from=${from}&to=${to}`)
      .set('X-Role', 'clinician');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('validates invalid date ranges', async () => {
    const res = await request(app)
      .get('/api/v1/clinicians/c1/appointments?from=2030-01-02&to=2030-01-01')
      .set('X-Role', 'clinician');

    expect(res.status).toBe(400);
  });

  it('enforces role', async () => {
    const res = await request(app)
      .get('/api/v1/clinicians/c1/appointments')
      .set('X-Role', 'patient');

    expect(res.status).toBe(403);
  });
});