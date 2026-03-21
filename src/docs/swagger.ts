import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clinic Appointment API',
      version: '1.0.0',
    },
    paths: {
      '/api/v1/appointments': {
        post: {
          summary: 'Create appointment (patient)',
          parameters: [
            {
              name: 'X-Role',
              in: 'header',
              required: true,
              schema: { type: 'string', enum: ['patient'] },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['clinicianId', 'patientId', 'start', 'end'],
                  properties: {
                    clinicianId: { type: 'string' },
                    patientId: { type: 'string' },
                    start: { type: 'string', format: 'date-time' },
                    end: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Appointment created' },
            400: { description: 'Invalid input' },
            403: { description: 'Forbidden' },
            409: { description: 'Overlap conflict' },
          },
        },
        get: {
          summary: 'List all upcoming appointments (admin)',
          parameters: [
            {
              name: 'X-Role',
              in: 'header',
              required: true,
              schema: { type: 'string', enum: ['admin'] },
            },
            {
              name: 'from',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'to',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer' },
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: { description: 'List of appointments' },
            400: { description: 'Invalid query params' },
            403: { description: 'Forbidden' },
          },
        },
      },

      '/api/v1/clinicians/{id}/appointments': {
        get: {
          summary: 'List clinician appointments',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'X-Role',
              in: 'header',
              required: true,
              schema: { type: 'string', enum: ['clinician'] },
            },
            {
              name: 'from',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'to',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
            },
          ],
          responses: {
            200: { description: 'List of clinician appointments' },
            400: { description: 'Invalid query params' },
            403: { description: 'Forbidden' },
          },
        },
      },
    },
  },
  apis: [],
});