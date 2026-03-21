import { prisma } from '../db/prisma';
import { Prisma } from '@prisma/client';
import { config } from '../env';
import { appointmentCreationMutex } from '../utils/lock';
import { ConflictError } from '../utils/errors';

export async function createAppointment(data: {
  clinicianId: string;
  patientId: string;
  start: Date;
  end: Date;
}) {
  const { clinicianId, patientId, start, end } = data;

    return appointmentCreationMutex.runExclusive(clinicianId, async () => {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.clinician.upsert({
          where: { id: clinicianId },
          update: {},
          create: { id: clinicianId },
        });

        await tx.patient.upsert({
          where: { id: patientId },
          update: {},
          create: { id: patientId },
        });

        const overlap = await tx.appointment.findFirst({
          where: {
            clinicianId,
            start: { lt: end },
            end: {gt: start},
          }
        });

        if (overlap) {
          throw new ConflictError(
            'Requested appointment overlaps an existing appointment for this clinician'
          );
        }

        return tx.appointment.create({
          data: {
            clinicianId,
            patientId,
            start,
            end,
          },
        });
    });
  });
}

function buildDateFilter(from?: Date, to?: Date) {
  const now = new Date();

  const startFilter: any = {
    gte: from ?? now,
  };

  if (to) {
    startFilter.lte = to;
  }

  return startFilter;
}

export async function getAppointmentsByClinician(params: {
  clinicianId: string;
  from?: Date;
  to?: Date;
}) {
  const { clinicianId, from, to } = params;

  return prisma.appointment.findMany({
    where: {
      clinicianId,
      start: buildDateFilter(from, to),
    },
    orderBy: {
      start: 'asc',
    },
  });
}

export async function getAllAppointments(params: {
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    from,
    to,
    limit,
    offset,
  } = params;

  const finalLimit = limit ?? config.defaultPageLimit;
  const finalOffset = offset ?? config.defaultPageOffset;

  return prisma.appointment.findMany({
    where: {
      start: buildDateFilter(from, to),
    },
    orderBy: {
      start: 'asc',
    },
    take: finalLimit,
    skip: finalOffset,
  });
}