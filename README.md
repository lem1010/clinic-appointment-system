---

# Clinic Appointment System API

A RESTful API for managing clinic appointments, built with TypeScript, Express, Prisma, and SQLite.

The system supports
- Patients booking appointments
- Clinicians viewing their schedules
- Admins listing all upcoming appointments

The implementation focuses on correctness, validation, and safe handling of concurrent requests.

---

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite
- Jest + Supertest
- Docker

---

## Running the Project (Local)

Install dependencies and start the server:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
````

The API will be available at:

```
http://localhost:3000/api/v1
```

Swagger UI (OpenAPI docs):

```
http://localhost:3000/docs
```

---

## Running with Docker

Build and run the container:

```bash
docker compose down -v
docker compose up --build
```

The API will be available at:

```
http://localhost:3000/api/v1
```

Swagger UI:

```
http://localhost:3000/docs
```

---

## Running Tests

Run all tests:

```bash
npm test
```

Or run the full local CI flow:

```bash
npm run ci:local
```

Tests cover:

* Appointment creation
* Overlap rejection
* Validation rules
* Clinician queries
* Admin queries
* Pagination
* Role enforcement

---

## Example Requests

A full set of curl-based test scenarios is provided in:

```
docs/curl-examples.sh
```

Example: create appointment

```bash
curl -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "1-clinician",
    "patientId": "1-patient",
    "start": "2026-03-25T09:00:00.000Z",
    "end": "2026-03-25T10:00:00.000Z"
  }'
```

---

## Design Decisions

### Validation

Input validation is enforced using Zod and custom validation logic:

* ISO datetime validation
* `start < end` strictly enforced
* Appointments in the past are rejected
* Missing or empty fields are rejected

---

### Overlap Detection

Appointments are considered overlapping if:

```
start < other.end && end > other.start
```

This ensures:

* Partial overlaps are rejected
* Fully overlapping ranges are rejected
* Boundary-touching appointments are allowed (`end == other.start`)

---

### Role-Based Access

Roles are simulated via:

* `X-Role` header

Access is enforced using middleware:

* `patient` → POST /appointments
* `clinician` → GET clinician endpoints
* `admin` → GET /appointments

---

### Pagination

Admin endpoint supports:

* `limit`
* `offset`

Defaults are configured via environment variables.

---

## Concurrency and Race Condition Handling

My solution uses keyed mutual exclusion (mutex) to ensure only one async appointment creation task runs at a time per clinicianId key. More specifically, it handles race conditions by forcing locked appointment creation tasks to run sequentially via a queue chain such that each task receives a promise from the task previous to it in the chain.

---

## Trade-offs and Limitations

SQLite was chosen for simplicity and ease of setup. While lightweight, it has limited concurrency guarantees compared to other databases that are commonly used in production (e.g. PostgreSQL) and this was a key consideration for tackling the concurrency-safe appointment creation challenge through application-locking rather than DB-level constraint.

The in-memory mutex approach ensures correctness in a single-instance environment. In a distributed or horizontally scaled system, this would need to be replaced with a more robust solution such as database-level constraints or distributed locking.

Tests do not simulate true parallel concurrency, but the implementation is safe by design due to the application-level locking mechanism.

---