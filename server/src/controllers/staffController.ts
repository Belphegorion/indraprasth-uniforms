import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { AuthRequest } from '../middleware/auth';

export const listStaff = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staffMembers = await Admin.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: staffMembers,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to list staff' });
  }
};

export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role = 'staff' } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    return;
  }

  try {
    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newAdmin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role === 'owner' ? 'owner' : 'staff',
      isActive: true,
      tokenVersion: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create staff account' });
  }
};

export const toggleStaffStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (req.user && req.user._id.toString() === id) {
      res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });
      return;
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      res.status(404).json({ success: false, error: 'Staff account not found' });
      return;
    }

    admin.isActive = !admin.isActive;
    if (!admin.isActive) {
      // Invalidate existing sessions immediately
      admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    }
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Staff account ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: admin,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to toggle staff status' });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (req.user && req.user._id.toString() === id) {
      res.status(400).json({ success: false, error: 'Cannot delete your own account' });
      return;
    }

    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Staff account not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Staff account deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete staff account' });
  }
};
