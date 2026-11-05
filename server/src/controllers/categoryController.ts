import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const getPublicCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const categoryCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(categoryCounts.map((c) => [c._id.toString(), c.count]));

  const result = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));

  res.status(200).json({ success: true, data: result });
};

export const getAdminCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();

  const categoryCounts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(categoryCounts.map((c) => [c._id.toString(), c.count]));

  const result = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));

  res.status(200).json({ success: true, data: result });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  if (!data.slug) {
    data.slug = slugify(data.name);
  } else {
    data.slug = slugify(data.slug);
  }

  const category = await Category.create(data);
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.slug) {
    updates.slug = slugify(updates.slug);
  }

  const category = await Category.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found' });
    return;
  }

  res.status(200).json({ success: true, data: category });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Block deleting a category that has products
  const productCount = await Product.countDocuments({ category: id, isActive: true });
  if (productCount > 0) {
    res.status(400).json({
      success: false,
      error: `Cannot deactivate category. There are ${productCount} active products associated with it. Please reassign or delete them first.`,
    });
    return;
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Category deactivated successfully',
    data: category,
  });
};
