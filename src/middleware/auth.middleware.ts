import { Request, Response, NextFunction } from 'express';
import { ROLES, Role } from '../types/role';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const role =
    req.header('X-Role') ||
    (req.query.role as string | undefined);

  if (role && ROLES.includes(role as Role)) {
    req.role = role as Role;
  }

  next();
}