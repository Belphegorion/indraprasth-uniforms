import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { School } from '../models/School';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Setting } from '../models/Setting';

let mongoServer: MongoMemoryServer;
let dpsSchool: any;
let stJosephSchool: any;
let category: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Setting.create({
    businessName: 'Indraprasth Uniforms',
    deliveryFee: 50,
    freeDeliveryAbove: 1000,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await School.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  dpsSchool = await School.create({
    name: 'Delhi Public School Bhopal',
    code: 'DPS',
    slug: 'dps-bhopal',
    isActive: true,
  });

  stJosephSchool = await School.create({
    name: "St. Joseph's Co-ed School",
    code: 'STJ',
    slug: 'st-josephs-coed',
    isActive: true,
  });

  category = await Category.create({
    name: 'Winter-ware',
    slug: 'winter-ware',
    isActive: true,
    sortOrder: 1,
  });

  // Seed sample products
  await Product.create([
    {
      name: 'DPS Winter Blazer',
      slug: 'dps-winter-blazer',
      description: 'Official thermal woollen blazer',
      price: 1650,
      mrp: 1850,
      school: dpsSchool._id,
      category: category._id,
      gender: 'unisex',
      season: 'winter',
      typeGroup: 'outerwear',
      itemType: 'Blazer',
      images: [{ url: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1/blazer.jpg', publicId: 'p1' }],
      sizes: [
        { label: '32', stock: 10 },
        { label: '34', stock: 5 },
      ],
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'DPS Winter Full Shirt',
      slug: 'dps-winter-full-shirt',
      description: 'Full sleeve winter shirt',
      price: 690,
      mrp: 750,
      school: dpsSchool._id,
      category: category._id,
      gender: 'boys',
      season: 'winter',
      typeGroup: 'tops',
      itemType: 'Shirt',
      images: [{ url: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1/shirt.jpg', publicId: 'p2' }],
      sizes: [
        { label: '28', stock: 15 },
        { label: '30', stock: 20 },
      ],
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'DPS Winter Pant',
      slug: 'dps-winter-pant',
      description: 'Winter woollen trousers',
      price: 600,
      school: dpsSchool._id,
      category: category._id,
      gender: 'boys',
      season: 'winter',
      typeGroup: 'bottoms',
      itemType: 'Pant',
      images: [{ url: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1/pant.jpg', publicId: 'p3' }],
      sizes: [{ label: '30', stock: 12 }],
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'DPS Summer Half Sleeve Shirt',
      slug: 'dps-summer-shirt',
      description: 'Breathable summer shirt',
      price: 450,
      school: dpsSchool._id,
      category: category._id,
      gender: 'boys',
      season: 'summer',
      typeGroup: 'tops',
      itemType: 'Shirt',
      images: [{ url: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1/summer.jpg', publicId: 'p4' }],
      sizes: [{ label: '28', stock: 0 }], // Out of stock
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'DPS Inactive Sweater',
      slug: 'dps-inactive-sweater',
      description: 'Discontinued sweater',
      price: 800,
      school: dpsSchool._id,
      category: category._id,
      gender: 'unisex',
      season: 'winter',
      typeGroup: 'outerwear',
      itemType: 'Sweater',
      images: [{ url: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1/sweater.jpg', publicId: 'p5' }],
      sizes: [{ label: '32', stock: 10 }],
      isActive: false, // Inactive!
      isFeatured: false,
    },
    {
      name: 'St Joseph School Blazer',
      slug: 'st-joseph-blazer',
      description: 'Official St Joseph navy blazer',
      price: 1500,
      school: stJosephSchool._id,
      category: category._id,
      gender: 'unisex',
      season: 'winter',
      typeGroup: 'outerwear',
      itemType: 'Blazer',
      images: [{ url: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1/stj.jpg', publicId: 'p6' }],
      sizes: [{ label: '34', stock: 8 }],
      isActive: true,
      isFeatured: false,
    },
  ]);
});

describe('Browse API (GET /api/v1/products/browse)', () => {
  it('should return all active products with pagination and facets', async () => {
    const res = await request(app).get('/api/v1/products/browse');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
    // 5 active products total (1 inactive excluded)
    expect(res.body.data.pagination.total).toBe(5);
    expect(res.body.data.facets).toBeDefined();
    expect(res.body.data.facets.gender).toBeDefined();
    expect(res.body.data.facets.season).toBeDefined();
    expect(res.body.data.facets.typeGroup).toBeDefined();
    expect(res.body.data.facets.itemType).toBeDefined();
    expect(res.body.data.facets.size).toBeDefined();
    expect(res.body.data.facets.price).toBeDefined();
  });

  it('should filter products by school code or slug', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({ school: 'DPS' });

    expect(res.status).toBe(200);
    // 4 active DPS products
    expect(res.body.data.pagination.total).toBe(4);
    res.body.data.items.forEach((p: any) => {
      expect(p.school._id.toString()).toBe(dpsSchool._id.toString());
    });
  });

  it('should exclude inactive products from results and facets', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({ school: 'dps-bhopal' });

    expect(res.status).toBe(200);
    const names = res.body.data.items.map((p: any) => p.name);
    expect(names).not.toContain('DPS Inactive Sweater');

    // Facet check: Sweater should not appear in itemType facets because it is inactive
    const sweaterFacet = res.body.data.facets.itemType.find(
      (f: any) => f.value.toLowerCase() === 'sweater'
    );
    expect(sweaterFacet).toBeUndefined();
  });

  it('should filter by season and provide sibling facet counts', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({ school: 'dps-bhopal', season: 'winter' });

    expect(res.status).toBe(200);
    // 3 winter active products for DPS
    expect(res.body.data.pagination.total).toBe(3);
    res.body.data.items.forEach((p: any) => {
      expect(p.season).toBe('winter');
    });

    // Sibling facet check: season facets exclude own filter so summer count is still visible!
    const summerFacet = res.body.data.facets.season.find(
      (f: any) => f.value.toLowerCase() === 'summer'
    );
    expect(summerFacet).toBeDefined();
    expect(summerFacet.count).toBe(1);
  });

  it('should combine multiple filters across groups (gender, typeGroup, season)', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({
        school: 'dps-bhopal',
        gender: 'boys',
        typeGroup: 'tops',
        season: 'winter',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.total).toBe(1);
    expect(res.body.data.items[0].name).toBe('DPS Winter Full Shirt');
  });

  it('should filter by inStock=true (exclude zero stock)', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({ school: 'dps-bhopal', inStock: 'true' });

    expect(res.status).toBe(200);
    // DPS Summer Shirt has stock 0, so only 3 in stock
    expect(res.body.data.pagination.total).toBe(3);
    res.body.data.items.forEach((p: any) => {
      const totalStock = p.sizes.reduce((acc: number, s: any) => acc + s.stock, 0);
      expect(totalStock).toBeGreaterThan(0);
    });
  });

  it('should filter by price range', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({ minPrice: 1000, maxPrice: 2000 });

    expect(res.status).toBe(200);
    // DPS Winter Blazer (1650) and St Joseph Blazer (1500)
    expect(res.body.data.pagination.total).toBe(2);
    res.body.data.items.forEach((p: any) => {
      expect(p.price).toBeGreaterThanOrEqual(1000);
      expect(p.price).toBeLessThanOrEqual(2000);
    });
  });

  it('should handle search queries safely without regex injection crash', async () => {
    // Malicious regex chars that would cause RegExp syntax error if unescaped
    const dangerousQueries = ['[a-z', '(((', '*+?', '\\'];
    for (const q of dangerousQueries) {
      const res = await request(app)
        .get('/api/v1/products/browse')
        .query({ q });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });

  it('should support sorting by price ascending and descending', async () => {
    const resAsc = await request(app)
      .get('/api/v1/products/browse')
      .query({ sort: 'price_asc' });

    expect(resAsc.status).toBe(200);
    const pricesAsc = resAsc.body.data.items.map((p: any) => p.price);
    for (let i = 0; i < pricesAsc.length - 1; i++) {
      expect(pricesAsc[i]).toBeLessThanOrEqual(pricesAsc[i + 1]);
    }

    const resDesc = await request(app)
      .get('/api/v1/products/browse')
      .query({ sort: 'price_desc' });

    expect(resDesc.status).toBe(200);
    const pricesDesc = resDesc.body.data.items.map((p: any) => p.price);
    for (let i = 0; i < pricesDesc.length - 1; i++) {
      expect(pricesDesc[i]).toBeGreaterThanOrEqual(pricesDesc[i + 1]);
    }
  });

  it('should include Cache-Control header when query q is absent', async () => {
    const res = await request(app)
      .get('/api/v1/products/browse')
      .query({ school: 'dps-bhopal' });

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=60');
  });

  it('should return schools with live active counts via GET /api/v1/schools?withCounts=true', async () => {
    const res = await request(app)
      .get('/api/v1/schools')
      .query({ withCounts: 'true' });

    expect(res.status).toBe(200);
    const dps = res.body.data.find((s: any) => s.code === 'DPS');
    expect(dps).toBeDefined();
    // 4 active DPS products
    expect(dps.productCount).toBe(4);

    const stj = res.body.data.find((s: any) => s.code === 'STJ');
    expect(stj).toBeDefined();
    expect(stj.productCount).toBe(1);
  });
});
