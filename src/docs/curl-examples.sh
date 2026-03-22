## Appointments in the past

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "1-clinician",
    "patientId": "1-patient",
    "start": "2026-03-18T10:00:00.000Z",
    "end": "2026-03-18T11:00:00.000Z"
  }'

----------------------------------------------------------

## Appointments with end >= start: "start must be strictly before end"

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "1-clinician",
    "patientId": "1-patient",
    "start": "2027-03-22T11:00:00.000Z",
    "end": "2027-03-22T11:00:00.000Z"
  }'

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "1-clinician",
    "patientId": "1-patient",
    "start": "2027-03-22T12:00:00.000Z",
    "end": "2027-03-22T11:00:00.000Z"
  }'

----------------------------------------------------------

## Role enforcement

# Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: clinician" \
  -d '{
    "clinicianId": "1-clinician",
    "patientId": "1-patient",
    "start": "2027-03-22T10:00:00.000Z",
    "end": "2027-03-22T11:00:00.000Z"
  }'

----------------------------------------------------------

## Missing role in request header

# Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "clinicianId": "1-clinician",
    "patientId": "1-patient",
    "start": "2027-03-22T10:00:00.000Z",
    "end": "2027-03-22T11:00:00.000Z"
  }'

----------------------------------------------------------

## Overlapping appointments: "end == other.start it's fine; if start < other.end && end > other.start"

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

----------------------------------------------------------

## Invalid ISO datetimes

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "3-clinician",
    "patientId": "3-patient",
    "start": "2027-03-22T24:00:00.000Z",
    "end": "2027-03-22T25:00:00.000Z"
  }'

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "3-clinician",
    "patientId": "3-patient",
    "start": "2027-03-22T10:00:00.000Z",
    "end": "2027-13-22T11:00:00.000Z"
  }'

----------------------------------------------------------
## Missing/empty payload fields

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "4-clinician",
    "start": "2027-03-23T10:00:00.000Z",
    "end": "2027-03-23T11:00:00.000Z"
  }'

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "patientId": "4-patient",
    "start": "2027-03-23T10:00:00.000Z",
    "end": "2027-03-23T11:00:00.000Z"
  }'

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "",
    "patientId": "4-patient",
    "start": "2027-03-23T10:00:00.000Z",
    "end": "2027-03-23T11:00:00.000Z"
  }'

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "4-clinician",
    "patientId": "",
    "start": "2027-03-23T10:00:00.000Z",
    "end": "2027-03-23T11:00:00.000Z"
  }'


# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{}'

## Run these curl commands before running the subsequent curl tests
First two appointments should be set to times between the next 5-10 minutes or so from UTC now to test past appointment filtering (since creating appointments in past will be rejected).

---

export S1="2026-03-21T10:50:00.000Z"
export E1="2026-03-21T10:52:00.000Z"

export LT_S2="2026-03-21T10:52:59.000Z"

export S2="2026-03-21T10:53:00.000Z"
export E2="2026-03-21T10:55:00.000Z"

export GT_E2="2026-03-29T10:55:00.000Z"

export S3="2026-03-31T11:00:00.000Z"
export E3="2026-03-31T12:00:00.000Z"

# appointment 1
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "5-clinician",
    "patientId": "1-patient",
    "start": "'"$S1"'",
    "end": "'"$E1"'"
  }'


# appointment 2
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "5-clinician",
    "patientId": "2-patient",
    "start": "'"$S2"'",
    "end": "'"$E2"'"
  }'

# appointment 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "5-clinician",
    "patientId": "3-patient",
    "start": "'"$S3"'",
    "end": "'"$E3"'"
  }'


## GET clinician appointments

# Should return 200 OK with appointment 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments?from=$GT_E2" \
  -H "X-Role: clinician"

# Should return 200 OK with appointment 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments?to=$S3" \
  -H "X-Role: clinician"

# Should return 200 OK with appointments 2 and 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments?from=$S2&to=$S3" \
  -H "X-Role: clinician"

# Should return 200 OK with no appointments
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments?from=$E1&to=$LT_S2" \
  -H "X-Role: clinician"

# Should return 200 OK with appointment 3 (i.e. start >= UTC now)
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments" \
  -H "X-Role: clinician"


## Invalid from/to ISO datetimes

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments?from=$E3&to=$S3" \
  -H "X-Role: clinician"


# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments?from=2030-03-30T25:00:00.000Z" \
  -H "X-Role: clinician"


## Role enforcement/missing role

# Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments" \
  -H "X-Role: patient"

# Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/clinicians/5-clinician/appointments"


---


## GET admin appointments

# Should return 200 OK with appointment 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?from=$GT_E2" \
  -H "X-Role: admin"

# Should return 200 OK with appointment 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?to=$S3" \
  -H "X-Role: admin"

# Should return 200 OK with appointments 2 and 3
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?from=$S2&to=$S3" \
  -H "X-Role: admin"

# Should return 200 OK with no appointments
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?from=$E1&to=$LT_S2" \
  -H "X-Role: admin"


# Should return 200 OK with appointment 3 (i.e. start >= UTC now)
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments" \
  -H "X-Role: admin"


## Invalid from/to ISO datetimes

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?from=$E3&to=$S3" \
  -H "X-Role: admin"


# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?from=2030-03-30T25:00:00.000Z" \
  -H "X-Role: admin"


## Role enforcement/missing role

# Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments" \
  -H "X-Role: patient"

# Should return 403 Forbidden
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments"


## Admin GET with pagination limit/offset

# Should return 200 OK with appointment 3 (since it's only one w/ start >= UTC now)
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?limit=1" \
  -H "X-Role: admin"


# Should return 200 OK with no appointments (skips appointment 3)
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?limit=1&offset=1" \
  -H "X-Role: admin"


## Invalid pagination parameters

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?limit=nan" \
  -H "X-Role: admin"

# Should return 400 Bad Request
curl -s -w "\nStatus: %{http_code}\n" \
  -X GET "http://localhost:3000/api/v1/appointments?offset=nan" \
  -H "X-Role: admin"