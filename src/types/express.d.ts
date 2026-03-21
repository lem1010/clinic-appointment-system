import { Role } from './role';

declare global {
  namespace Express {
    interface Request {
      role?: Role;
    }
  }
}

export {};