import { Router, Request, Response, NextFunction } from 'express';
import { requireRole } from '../middleware/role.middleware';
import { BadRequestError } from '../utils/errors';
import {
  validateCreateAppointment,
} from '../middleware/validation.middleware';
import {
  createAppointment,
  getAllAppointments,
} from '../services/appointments.service';
import { 
  assertValidDate, 
  validateDateRange 
} from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/',
  requireRole('patient'),
  validateCreateAppointment,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointment = await createAppointment(req.body);

      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, limit, offset } = req.query;

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

      const parsedLimit = limit ? Number(limit) : undefined;
      const parsedOffset = offset ? Number(offset) : undefined;

      if (parsedLimit !== undefined && Number.isNaN(parsedLimit)) {
        throw new BadRequestError('Invalid limit');
      }

      if (parsedOffset !== undefined && Number.isNaN(parsedOffset)) {
        throw new BadRequestError('Invalid offset');
      }

      const appointments = await getAllAppointments({
        from: fromDate,
        to: toDate,
        limit: parsedLimit,
        offset: parsedOffset,
      });

      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }
);

export default router;