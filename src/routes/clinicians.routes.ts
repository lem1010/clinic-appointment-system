import { Router, Request, Response, NextFunction } from 'express';
import { requireRole } from '../middleware/role.middleware';
import { getAppointmentsByClinician } from '../services/appointments.service';
import { 
  assertValidDate, 
  validateDateRange 
} from '../middleware/validation.middleware';

const router = Router();

router.get(
  '/:id/appointments',
  requireRole('clinician'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clinicianId = req.params.id;

      const { from, to } = req.query;

      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      if (from) {
        fromDate = new Date(from as string);
        assertValidDate(fromDate, 'Invalid from datetime');
      }

      if (to) {
        toDate = new Date(to as string);
        assertValidDate(toDate, 'Invalid to datetime');
      }

      if (fromDate && toDate) {
        validateDateRange(fromDate, toDate, 'from must be before to');
      }

      const appointments = await getAppointmentsByClinician({
        clinicianId,
        from: fromDate,
        to: toDate,
      });

      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }
);

export default router;