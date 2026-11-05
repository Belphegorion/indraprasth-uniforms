import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { School } from '../models/School';
import { Category } from '../models/Category';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { inferProductFilters } from '../scripts/migrateFilters';

// Helper to escape regex special characters
export const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// Helper to generate a clean URL slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const browsePublicProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    school,
    q,
    gender,
    season,
    typeGroup,
    itemType,
    size,
    minPrice,
    maxPrice,
    inStock,
    sort = 'relevance',
    page = 1,
    limit = 12,
  } = req.query as any;

  // Short HTTP caching for non-search requests
  if (!q) {
    res.setHeader('Cache-Control', 'public, max-age=60');
  }

  // Resolve school if provided
  let schoolId: mongoose.Types.ObjectId | undefined;
  if (school) {
    if (mongoose.Types.ObjectId.isValid(school.toString()) && school.toString().length === 24) {
      schoolId = new mongoose.Types.ObjectId(school.toString());
    } else {
      const schoolStr = school.toString().trim();
      const foundSchool = await School.findOne({
        $or: [
          { slug: schoolStr.toLowerCase() },
          { code: schoolStr.toUpperCase() },
          { name: new RegExp(`^${escapeRegex(schoolStr)}$`, 'i') },
        ],
      });
      if (foundSchool) {
        schoolId = foundSchool._id as mongoose.Types.ObjectId;
      } else {
        // School parameter provided but does not exist: return empty results
        schoolId = new mongoose.Types.ObjectId();
      }
    }
  }

  // Sanitize and cap search query at 80 chars
  let searchRegex: RegExp | undefined;
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const sanitizedQ = escapeRegex(q.trim().slice(0, 80));
    searchRegex = new RegExp(sanitizedQ, 'i');
  }

  // Normalize multi-valued filter arrays
  const toArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
    if (typeof val === 'string') return val.split(',').map((v) => v.trim()).filter(Boolean);
    return [];
  };

  const genders = toArray(gender);
  const seasons = toArray(season);
  const typeGroups = toArray(typeGroup);
  const itemTypes = toArray(itemType);
  const sizes = toArray(size);

  const minPriceNum = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined;
  const inStockBool = inStock === true || inStock === 'true' || inStock === '1';

  // Helper to build match criteria, optionally excluding own filter key so users can see sibling facet counts
  const buildMatch = (excludeKey?: 'gender' | 'season' | 'typeGroup' | 'itemType' | 'size' | 'price'): any => {
    const match: any = { isActive: true };

    if (schoolId) {
      match.school = schoolId;
    }

    if (searchRegex) {
      match.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { itemType: searchRegex },
      ];
    }

    if (inStockBool) {
      match['sizes.stock'] = { $gt: 0 };
    }

    if (excludeKey !== 'gender' && genders.length > 0) {
      match.gender = { $in: genders };
    }

    if (excludeKey !== 'season' && seasons.length > 0) {
      match.season = { $in: seasons };
    }

    if (excludeKey !== 'typeGroup' && typeGroups.length > 0) {
      match.typeGroup = { $in: typeGroups };
    }

    if (excludeKey !== 'itemType' && itemTypes.length > 0) {
      match.itemType = { $in: itemTypes };
    }

    if (excludeKey !== 'size' && sizes.length > 0) {
      match['sizes.label'] = { $in: sizes };
    }

    if (excludeKey !== 'price' && (minPriceNum !== undefined || maxPriceNum !== undefined)) {
      match.price = {};
      if (minPriceNum !== undefined) match.price.$gte = minPriceNum;
      if (maxPriceNum !== undefined) match.price.$lte = maxPriceNum;
    }

    return match;
  };

  // Sorting
  let sortStage: any = { isFeatured: -1, createdAt: -1, _id: 1 };
  if (sort === 'price_asc') sortStage = { price: 1, _id: 1 };
  else if (sort === 'price_desc') sortStage = { price: -1, _id: 1 };
  else if (sort === 'newest') sortStage = { createdAt: -1, _id: 1 };
  else if (sort === 'name_asc') sortStage = { name: 1, _id: 1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Single $facet aggregation
  const facetResult = await Product.aggregate([
    {
      $facet: {
        items: [
          { $match: buildMatch() },
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limitNum },
          {
            $lookup: {
              from: 'schools',
              localField: 'school',
              foreignField: '_id',
              as: 'school',
              pipeline: [{ $project: { name: 1, code: 1, slug: 1, logoUrl: 1, branchLabel: 1 } }],
            },
          },
          { $unwind: { path: '$school', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
              pipeline: [{ $project: { name: 1, slug: 1 } }],
            },
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              __v: 0,
            },
          },
        ],
        totalCount: [{ $match: buildMatch() }, { $count: 'count' }],
        genderFacets: [
          { $match: buildMatch('gender') },
          { $group: { _id: '$gender', count: { $sum: 1 } } },
          { $project: { value: '$_id', count: 1, _id: 0 } },
        ],
        seasonFacets: [
          { $match: buildMatch('season') },
          { $group: { _id: '$season', count: { $sum: 1 } } },
          { $project: { value: '$_id', count: 1, _id: 0 } },
        ],
        typeGroupFacets: [
          { $match: buildMatch('typeGroup') },
          { $group: { _id: '$typeGroup', count: { $sum: 1 } } },
          { $project: { value: '$_id', count: 1, _id: 0 } },
        ],
        itemTypeFacets: [
          { $match: buildMatch('itemType') },
          { $group: { _id: '$itemType', count: { $sum: 1 } } },
          { $project: { value: '$_id', count: 1, _id: 0 } },
        ],
        sizeFacets: [
          { $match: buildMatch('size') },
          { $unwind: '$sizes' },
          ...(inStockBool ? [{ $match: { 'sizes.stock': { $gt: 0 } } }] : []),
          { $group: { _id: '$sizes.label', count: { $sum: 1 } } },
          { $project: { value: '$_id', count: 1, _id: 0 } },
        ],
        priceRange: [
          { $match: buildMatch('price') },
          {
            $group: {
              _id: null,
              min: { $min: '$price' },
              max: { $max: '$price' },
            },
          },
          {
            $project: {
              _id: 0,
              min: { $ifNull: ['$min', 0] },
              max: { $ifNull: ['$max', 2000] },
            },
          },
        ],
      },
    },
  ]);

  const output = facetResult[0] || {};
  const rawItems = output.items || [];
  const items = rawItems.map((item: any) => ({
    ...item,
    id: item._id ? item._id.toString() : undefined,
  }));
  const total = output.totalCount[0]?.count || 0;
  const priceData = output.priceRange[0] || { min: 0, max: 2000 };

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
      facets: {
        gender: output.genderFacets || [],
        season: output.seasonFacets || [],
        typeGroup: output.typeGroupFacets || [],
        itemType: output.itemTypeFacets || [],
        size: output.sizeFacets || [],
        price: {
          min: priceData.min ?? 0,
          max: priceData.max ?? 2000,
        },
      },
    },
  });
};

export const getPublicProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    q,
    school,
    category,
    gender,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 20,
  } = req.query as any;

  const filter: any = { isActive: true };

  if (q && typeof q === 'string' && q.trim().length > 0) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  if (school) {
    if (school.toString().match(/^[0-9a-fA-F]{24}$/)) {
      filter.school = school;
    } else {
      const schoolStr = school.toString().trim();
      const foundSchool = await School.findOne({
        $or: [
          { slug: schoolStr.toLowerCase() },
          { code: schoolStr.toUpperCase() },
          { name: new RegExp(`^${schoolStr}$`, 'i') },
        ],
      });
      if (foundSchool) {
        filter.school = foundSchool._id;
      } else {
        // School specified in filter but not found in DB: guarantee 0 products returned
        filter.school = new mongoose.Types.ObjectId();
      }
    }
  }

  if (category) {
    if (category.toString().match(/^[0-9a-fA-F]{24}$/)) {
      filter.category = category;
    } else {
      const catStr = category.toString().trim();
      const foundCategory = await Category.findOne({
        $or: [
          { slug: slugify(catStr) },
          { slug: catStr.toLowerCase() },
          { name: new RegExp(`^${catStr}$`, 'i') },
        ],
      });
      if (foundCategory) {
        filter.category = foundCategory._id;
      } else {
        // Category specified in filter but not found in DB: guarantee 0 products returned
        filter.category = new mongoose.Types.ObjectId();
      }
    }
  }

  if (gender) {
    filter.gender = gender;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  // Sorting
  let sortOption: any = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'name_asc') sortOption = { name: 1 };
  else if (sort === 'featured') sortOption = { isFeatured: -1, createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('school', 'name code slug logoUrl')
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true })
    .populate('school', 'name code slug logoUrl')
    .populate('category', 'name slug')
    .lean();

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  // Fetch related products from same school
  const related = await Product.find({
    school: product.school,
    _id: { $ne: product._id },
    isActive: true,
  })
    .populate('school', 'name code slug')
    .populate('category', 'name slug')
    .limit(4)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      ...product,
      related,
    },
  });
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('school', 'name code slug logoUrl')
    .populate('category', 'name slug')
    .limit(8)
    .lean();

  res.status(200).json({
    success: true,
    data: products,
  });
};

// Admin Endpoints
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  const { q, school, category, gender, season, typeGroup, isActive, page = 1, limit = 20 } = req.query as any;

  const filter: any = {};

  if (q && typeof q === 'string' && q.trim().length > 0) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { sku: searchRegex }, { description: searchRegex }];
  }

  if (school) filter.school = school;
  if (category) filter.category = category;
  if (gender) filter.gender = gender;
  if (season) filter.season = season;
  if (typeGroup) filter.typeGroup = typeGroup;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('school', 'name code slug')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id)
    .populate('school')
    .populate('category');

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  res.status(200).json({ success: true, data: product });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  if (!data.slug) {
    data.slug = slugify(data.name);
  } else {
    data.slug = slugify(data.slug);
  }

  // Ensure unique slug
  let slug = data.slug;
  let counter = 1;
  while (await Product.exists({ slug })) {
    slug = `${data.slug}-${counter++}`;
  }
  data.slug = slug;

  const product = await Product.create(data);
  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.slug) {
    updates.slug = slugify(updates.slug);
    const existing = await Product.findOne({ slug: updates.slug, _id: { $ne: id } });
    if (existing) {
      res.status(400).json({ success: false, error: 'Slug is already in use by another product' });
      return;
    }
  }

  const product = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  res.status(200).json({ success: true, data: product });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  // Soft-delete: toggle isActive to false
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Product soft-deleted (deactivated) successfully',
    data: product,
  });
};

export const importProductsCsv = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'Please upload a CSV file' });
    return;
  }

  const results: any[] = [];
  const errors: Array<{ row: number; error: string }> = [];
  let rowNumber = 1;

  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csvParser())
    .on('data', (data) => {
      rowNumber++;
      results.push({ rowNumber, data });
    })
    .on('end', async () => {
      let importedCount = 0;

      for (const item of results) {
        try {
          const { data, rowNumber: row } = item;
          const name = data.name || data.Name;
          const price = Number(data.price || data.Price);
          const schoolCode = (data.schoolCode || data.school || data.School || '').trim().toUpperCase();
          const categoryName = (data.category || data.Category || 'Winter-ware').trim();
          const imageUrl = data.imageUrl || data.image || data.Image || '';

          if (!name || isNaN(price) || price <= 0 || !schoolCode) {
            errors.push({
              row,
              error: 'Missing required fields: Name, Price, or School Code',
            });
            continue;
          }

          // Resolve school
          let school = await School.findOne({ code: schoolCode });
          if (!school) {
            school = await School.create({
              name: schoolCode,
              code: schoolCode,
              slug: slugify(schoolCode),
            });
          }

          // Resolve category
          let category = await Category.findOne({
            slug: slugify(categoryName),
          });
          if (!category) {
            category = await Category.create({
              name: categoryName,
              slug: slugify(categoryName),
            });
          }

          const slug = slugify(name);
          const sku = (data.sku || data.SKU || '').trim() || undefined;
          const sizes = data.sizes
            ? typeof data.sizes === 'string'
              ? JSON.parse(data.sizes)
              : data.sizes
            : [{ label: 'Standard', stock: 20 }];

          const inferred = inferProductFilters(name, data.description || '');
          const season = data.season || data.Season || inferred.season;
          const typeGroup = data.typeGroup || data.TypeGroup || inferred.typeGroup;
          const itemType = data.itemType || data.ItemType || inferred.itemType;
          const query = sku ? { $or: [{ sku }, { slug }] } : { slug };

          await Product.findOneAndUpdate(
            query,
            {
              name,
              slug,
              description: data.description || `${name} for ${school.name}`,
              price,
              school: school._id,
              category: category._id,
              images: [
                {
                  url: imageUrl || 'https://res.cloudinary.com/dvaynkflu/image/upload/v1791370845/indraprasth/products/ngfiqedvngrgzvuc12td.png',
                  publicId: 'csv_imported',
                },
              ],
              sizes,
              gender: data.gender || 'unisex',
              season,
              typeGroup,
              itemType,
              isActive: true,
              ...(sku && { sku }),
            },
            { upsert: true, new: true }
          );

          importedCount++;
        } catch (err: any) {
          errors.push({ row: item.rowNumber, error: err.message || 'Import error' });
        }
      }

      res.status(200).json({
        success: true,
        data: {
          importedCount,
          totalRows: results.length,
          errors,
        },
      });
    })
    .on('error', (err) => {
      res.status(500).json({ success: false, error: err.message });
    });
};
