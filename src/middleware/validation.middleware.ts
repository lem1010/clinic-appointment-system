import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { BadRequestError, ConflictError } from '../utils/errors';
import { prisma } from '../db/prisma';
import { config } from '../env';

const createAppointmentSchema = z.object({
  clinicianId: z.string().min(1, 'clinicianId is required'),
  patientId: z.string().min(1, 'patientId is required'),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export function assertValidDate(
  date: Date,
  message = 'Invalid datetime'
) {
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(message);
  }
}

export function validateDateRange(
  start: Date,
  end: Date,
  message = 'start must be strictly before end'
) {
  if (start >= end) {
    throw new BadRequestError(message);
  }
}

export function validateNotPastDate(
  date: Date,
  message = 'Date is in the past'
) {
    const now = new Date();
    const minStart = new Date(now.getTime() + config.appointmentMinLeadTimeMs);
    if (date < minStart) {
      throw new BadRequestError(message);
    }
}

export function validateCreateAppointment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createAppointmentSchema.parse(req.body);

    const start = new Date(parsed.start);
    const end = new Date(parsed.end);

    // Requirement:
    // "Validate ISO datetimes"
    assertValidDate(start);
    assertValidDate(end);

    // Requirement:
    // "Validate start < end"
    validateDateRange(start, end);

    // Requirement:
    // "Reject appointments in the past"
    validateNotPastDate(start);

    req.body = {
      clinicianId: parsed.clinicianId,
      patientId: parsed.patientId,
      start,
      end,
    };

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new BadRequestError('Invalid request'));
    }
    next(err);
  }
}