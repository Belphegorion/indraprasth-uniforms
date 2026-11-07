import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const COOKIE_NAME = 'token';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  if (!admin.isActive) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = jwt.sign(
    { id: admin._id, role: admin.role, tokenVersion: admin.tokenVersion || 0 },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EIGHT_HOURS_MS,
    domain: env.COOKIE_DOMAIN || undefined,
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt,
      },
      token, // Also return token for convenience in API tests / client headers
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        if (decoded?.id) {
          await Admin.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } });
        }
      } catch {
        // Token already expired/invalid
      }
    }
  } catch {
    // Graceful logout fallback
  }

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        lastLoginAt: req.user.lastLoginAt,
      },
    },
  });
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.user._id);

  if (!admin) {
    res.status(404).json({ success: false, error: 'Admin account not found' });
    return;
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400).json({ success: false, error: 'Current password does not match' });
    return;
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.tokenVersion = (admin.tokenVersion || 0) + 1;
  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
};
