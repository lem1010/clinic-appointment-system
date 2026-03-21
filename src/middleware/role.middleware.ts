import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/role';
import { ForbiddenError } from '../utils/errors';

export function requireRole(requiredRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== requiredRole) {
      throw new ForbiddenError('Not permitted');
    }

    next();
  };
}