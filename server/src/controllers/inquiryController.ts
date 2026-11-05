import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry';

export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  const inquiry = await Inquiry.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Inquiry received. Our uniform consultant will contact you shortly.',
    data: inquiry,
  });
};

export const getAdminInquiries = async (req: Request, res: Response): Promise<void> => {
  const { type, status, page = 1, limit = 20 } = req.query as any;

  const filter: any = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: inquiries,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const patchInquiry = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  res.status(200).json({ success: true, data: inquiry });
};
