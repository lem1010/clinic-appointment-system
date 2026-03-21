import express from 'express';
import appointmentsRoutes from './routes/appointments.routes';
import cliniciansRoutes from './routes/clinicians.routes';
import { authMiddleware } from './middleware/auth.middleware';
import swaggerUi  from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(express.json());
app.use(authMiddleware);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/appointments', appointmentsRoutes);
app.use('/api/v1/clinicians', cliniciansRoutes);

export default app;