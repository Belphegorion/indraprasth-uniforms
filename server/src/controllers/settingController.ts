import { Request, Response } from 'express';
import { Setting } from '../models/Setting';

export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await Setting.getSettings();
  res.status(200).json({
    success: true,
    data: {
      businessName: settings.businessName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      phones: settings.phones,
      email: settings.email,
      whatsappNumber: settings.whatsappNumber,
      address: settings.address,
      branches: settings.branches,
      deliveryFee: settings.deliveryFee,
      freeDeliveryAbove: settings.freeDeliveryAbove,
      announcementBar: settings.announcementBar,
      socialLinks: settings.socialLinks,
    },
  });
};

export const getAdminSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await Setting.getSettings();
  res.status(200).json({
    success: true,
    data: settings,
  });
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings,
  });
};
