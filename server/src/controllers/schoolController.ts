import { Request, Response } from 'express';
import { School } from '../models/School';
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

export const getPublicSchools = async (req: Request, res: Response): Promise<void> => {
  const { withCounts, q, gender, season, typeGroup, itemType, size, minPrice, maxPrice, inStock } = req.query as any;

  const schools = await School.find({ isActive: true }).sort({ name: 1 }).lean();

  if (withCounts === 'true' || withCounts === true) {
    // Build filter matching active products respecting current filters (excluding school)
    const match: any = { isActive: true };

    if (q && typeof q === 'string' && q.trim().length > 0) {
      const escaped = q.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').slice(0, 80);
      const searchRegex = new RegExp(escaped, 'i');
      match.$or = [{ name: searchRegex }, { description: searchRegex }, { itemType: searchRegex }];
    }

    if (inStock === 'true' || inStock === true) {
      match['sizes.stock'] = { $gt: 0 };
    }

    const toArr = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((v) => v.trim()).filter(Boolean);
      return [];
    };

    const genders = toArr(gender);
    if (genders.length > 0) match.gender = { $in: genders };

    const seasons = toArr(season);
    if (seasons.length > 0) match.season = { $in: seasons };

    const typeGroups = toArr(typeGroup);
    if (typeGroups.length > 0) match.typeGroup = { $in: typeGroups };

    const itemTypes = toArr(itemType);
    if (itemTypes.length > 0) match.itemType = { $in: itemTypes };

    const sizes = toArr(size);
    if (sizes.length > 0) match['sizes.label'] = { $in: sizes };

    if (minPrice !== undefined || maxPrice !== undefined) {
      match.price = {};
      if (minPrice !== undefined && minPrice !== '') match.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') match.price.$lte = Number(maxPrice);
    }

    const schoolCounts = await Product.aggregate([
      { $match: match },
      { $group: { _id: '$school', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(schoolCounts.map((sc) => [sc._id.toString(), sc.count]));

    const result = schools.map((s) => ({
      ...s,
      productCount: countMap.get(s._id.toString()) || 0,
    }));

    res.status(200).json({ success: true, data: result });
    return;
  }

  // Fallback: standard active counts
  const schoolCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$school', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(schoolCounts.map((sc) => [sc._id.toString(), sc.count]));

  const result = schools.map((s) => ({
    ...s,
    productCount: countMap.get(s._id.toString()) || 0,
  }));

  res.status(200).json({ success: true, data: result });
};

export const getAdminSchools = async (_req: Request, res: Response): Promise<void> => {
  const schools = await School.find().sort({ name: 1 }).lean();

  const productCounts = await Product.aggregate([
    { $group: { _id: '$school', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(productCounts.map((pc) => [pc._id.toString(), pc.count]));

  const result = schools.map((s) => ({
    ...s,
    productCount: countMap.get(s._id.toString()) || 0,
  }));

  res.status(200).json({ success: true, data: result });
};

export const createSchool = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  if (!data.slug) {
    data.slug = slugify(data.code || data.name);
  }
  data.code = data.code.toUpperCase();

  const school = await School.create(data);
  res.status(201).json({ success: true, data: school });
};

export const updateSchool = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.code) {
    updates.code = updates.code.toUpperCase();
  }
  if (updates.slug) {
    updates.slug = slugify(updates.slug);
  }

  const school = await School.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!school) {
    res.status(404).json({ success: false, error: 'School not found' });
    return;
  }

  res.status(200).json({ success: true, data: school });
};

export const deleteSchool = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Block deleting a school that has products
  const productCount = await Product.countDocuments({ school: id, isActive: true });
  if (productCount > 0) {
    res.status(400).json({
      success: false,
      error: `Cannot deactivate school. There are ${productCount} active products associated with it. Please reassign or delete them first.`,
    });
    return;
  }

  const school = await School.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!school) {
    res.status(404).json({ success: false, error: 'School not found' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'School deactivated successfully',
    data: school,
  });
};
