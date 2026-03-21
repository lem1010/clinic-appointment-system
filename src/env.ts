import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string().default('file:./dev.db'),
  MIN_LEAD_TIME_MS: z.coerce.number().default(1000),
  DEFAULT_PAGE_LIMIT: z.string().default('20'),
  DEFAULT_PAGE_OFFSET: z.string().default('0'),
});

const parsed = envSchema.parse(process.env);

export const config = {
  port: parsed.PORT ? Number(parsed.PORT) : 3000,
  databaseUrl: parsed.DATABASE_URL,
  appointmentMinLeadTimeMs: parsed.MIN_LEAD_TIME_MS,
  defaultPageLimit: Number(parsed.DEFAULT_PAGE_LIMIT),
  defaultPageOffset: Number(parsed.DEFAULT_PAGE_OFFSET),
};