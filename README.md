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

## Example Curl Requests

A full set of curl-based test scenarios is provided in:

```
src/docs/curl-examples.sh
```

### POST /appointments

```bash
# Should return 201 Created
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "2-clinician",
    "patientId": "1-patient",
    "start": "2027-03-22T10:00:00.000Z",
    "end": "2027-03-22T11:00:00.000Z"
  }'

# Should return 201 Created
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "2-clinician",
    "patientId": "2-patient",
    "start": "2027-03-22T12:00:00.000Z",
    "end": "2027-03-22T13:00:00.000Z"
  }'

# Should return 409 Conflict
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "2-clinician",
    "patientId": "3-patient",
    "start": "2027-03-22T10:59:59.000Z",
    "end": "2027-03-22T11:59:59.000Z"
  }'

# Should return 409 Conflict
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "2-clinician",
    "patientId": "3-patient",
    "start": "2027-03-22T10:59:59.000Z",
    "end": "2027-03-22T12:00:01.000Z"
  }'

# Should return 201 Created
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "2-clinician",
    "patientId": "3-patient",
    "start": "2027-03-22T11:00:00.000Z",
    "end": "2027-03-22T12:00:00.000Z"
  }'
```

### GET /clinicians/{id}/appointments

Supports optional ```from``` and ```to``` ISO datetime query params per behaviour specs.

```bash
# Should return 200 OK with appointments start >= UTC now
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/2-clinician/appointments" \
  -H "X-Role: clinician"

```

```bash
# Invalid from/to ISO datetimes: Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/2-clinician/appointments?from=2030-03-30T25:00:00.000Z" \
  -H "X-Role: clinician"
```

### GET /appointments

Also supports optional ```from``` and ```to``` ISO datetime query params per behaviour specs.

```bash
# Should return 200 OK with appointments i.e. start >= UTC now
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments" \
  -H "X-Role: admin"
```

```bash
# Role enforcement: Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments" \
  -H "X-Role: patient"
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