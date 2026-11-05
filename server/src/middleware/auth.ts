import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin, IAdminDocument } from '../models/Admin';
import { AdminRole } from '@indraprasth/shared';

export interface AuthRequest extends Request {
  user?: IAdminDocument;
}

interface JwtPayload {
  id: string;
  role: AdminRole;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      res.status(401).json({ success: false, error: 'User is inactive or not found' });
      return;
    }

    req.user = admin;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }
};

export const requireRole = (role: AdminRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (req.user.role !== role && req.user.role !== 'owner') {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions for this action',
      });
      return;
    }

    next();
  };
};
