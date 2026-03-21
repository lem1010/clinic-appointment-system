export const ROLES = ['admin', 'patient', 'clinician'] as const;

export type Role = typeof ROLES[number];