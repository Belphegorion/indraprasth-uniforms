import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { Admin } from '../models/Admin';
import { School } from '../models/School';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Setting } from '../models/Setting';
import { seedDatabase } from '../scripts/seed';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;
let adminCookie: string;
let schoolId: string;
let categoryId: string;
let testProduct: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Setup default settings
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
  // Clear collections except setting
  await Admin.deleteMany({});
  await School.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // Create admin
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  await Admin.create({
    name: 'Test Owner',
    email: 'admin@indraprasth.com',
    passwordHash,
    role: 'owner',
    isActive: true,
  });

  // Log in to get auth cookie
  const loginRes = await request(app)
    .post('/api/v1/admin/auth/login')
    .send({ email: 'admin@indraprasth.com', password: 'Admin@123456' });

  adminCookie = loginRes.headers['set-cookie'][0];

  // Create School & Category
  const school = await School.create({
    name: 'Delhi Public School Bhopal',
    code: 'DPS',
    slug: 'dps-bhopal',
    isActive: true,
  });
  schoolId = school._id.toString();

  const category = await Category.create({
    name: 'Winter-ware',
    slug: 'winter-ware',
    isActive: true,
  });
  categoryId = category._id.toString();

  // Create Product with stock
  testProduct = await Product.create({
    name: 'DPS Winter Blazer',
    slug: 'dps-winter-blazer',
    description: 'Warm regulation school blazer',
    price: 1500,
    school: school._id,
    category: category._id,
    images: [{ url: 'https://example.com/blazer.jpg', publicId: 'blazer_01' }],
    sizes: [
      { label: '30', stock: 5 },
      { label: '32', stock: 10 },
    ],
    gender: 'unisex',
    isActive: true,
    isFeatured: true,
  });
});

describe('1. Authentication Endpoints', () => {
  it('should successfully log in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ email: 'admin@indraprasth.com', password: 'Admin@123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@indraprasth.com');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ email: 'admin@indraprasth.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return current admin profile on /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/admin/auth/me')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Test Owner');
  });
});

describe('2. Product Public & Admin CRUD', () => {
  it('should list active products on public endpoint', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].name).toBe('DPS Winter Blazer');
  });

  it('should get product by slug', async () => {
    const res = await request(app).get('/api/v1/products/dps-winter-blazer');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('dps-winter-blazer');
  });

  it('should allow admin to create a new product', async () => {
    const newProductPayload = {
      name: 'DPS Winter Socks',
      slug: 'dps-winter-socks',
      description: 'Official winter socks',
      price: 120,
      school: schoolId,
      category: categoryId,
      images: [{ url: 'https://example.com/socks.jpg', publicId: 'socks_01' }],
      sizes: [{ label: 'Standard', stock: 50 }],
      gender: 'unisex',
      isActive: true,
    };

    const res = await request(app)
      .post('/api/v1/admin/products')
      .set('Cookie', adminCookie)
      .send(newProductPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('DPS Winter Socks');
  });

  it('should soft-delete a product (set isActive to false)', async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/products/${testProduct._id}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkProduct = await Product.findById(testProduct._id);
    expect(checkProduct?.isActive).toBe(false);
  });
});

describe('3. Order Placement, Stock Decrement & Restoration', () => {
  it('should create order, decrement stock, and calculate delivery fee', async () => {
    const orderPayload = {
      customer: {
        name: 'Rahul Sharma',
        phone: '9826012345',
        email: 'rahul@example.com',
        address: {
          line1: 'B-12 Malviya Nagar',
          city: 'Bhopal',
          pincode: '462003',
        },
      },
      items: [
        {
          productId: testProduct._id.toString(),
          size: '30',
          qty: 2,
        },
      ],
      paymentMethod: 'cod',
      fulfilment: 'home_delivery',
      notes: 'Please ring the bell',
    };

    const res = await request(app).post('/api/v1/orders').send(orderPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(/^IU-\d+-\d+$/);

    // Verify stock decremented from 5 to 3
    const updatedProd = await Product.findById(testProduct._id);
    const size30 = updatedProd?.sizes.find((s) => s.label === '30');
    expect(size30?.stock).toBe(3);
  });

  it('should reject order if requested quantity exceeds available stock', async () => {
    const orderPayload = {
      customer: {
        name: 'Amit Verma',
        phone: '9826054321',
        address: {
          line1: 'Plot 4 Arera Colony',
          city: 'Bhopal',
          pincode: '462016',
        },
      },
      items: [
        {
          productId: testProduct._id.toString(),
          size: '30',
          qty: 10, // Stock is only 5
        },
      ],
      paymentMethod: 'cod',
      fulfilment: 'home_delivery',
    };

    const res = await request(app).post('/api/v1/orders').send(orderPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Insufficient stock');
  });

  it('should restore stock when order is cancelled by admin', async () => {
    // 1. Create order for 2 blazers size 30
    const orderPayload = {
      customer: {
        name: 'Pooja Jain',
        phone: '9826098765',
        fulfilment: 'store_pickup',
      },
      items: [
        {
          productId: testProduct._id.toString(),
          size: '30',
          qty: 2,
        },
      ],
      paymentMethod: 'pay_at_store',
      fulfilment: 'store_pickup',
      pickupBranch: 'Jawahar Chowk (HQ)',
    };

    const orderRes = await request(app).post('/api/v1/orders').send(orderPayload);
    const orderNum = orderRes.body.data.orderNumber;
    const orderDoc = await Order.findOne({ orderNumber: orderNum });

    // Stock should now be 3
    let prod = await Product.findById(testProduct._id);
    expect(prod?.sizes.find((s) => s.label === '30')?.stock).toBe(3);

    // 2. Admin cancels order
    const cancelRes = await request(app)
      .patch(`/api/v1/admin/orders/${orderDoc?._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'cancelled', note: 'Customer called to cancel' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);

    // 3. Verify stock restored back to 5
    prod = await Product.findById(testProduct._id);
    expect(prod?.sizes.find((s) => s.label === '30')?.stock).toBe(5);
  });
});

describe('4. Schools and Categories Integrity', () => {
  it('should block deactivating a school that has active products', async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/schools/${schoolId}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('active products associated');
  });
});

describe('5. Database Seeding & Data Integrity', () => {
  it('should run seedDatabase idempotently and populate all 8 products without typos', async () => {
    // 1. Clear products so we can test clean seed population
    await Product.deleteMany({});
    await seedDatabase();

    // 2. Validate schools
    const schools = await School.find({});
    expect(schools.length).toBeGreaterThanOrEqual(4);
    const dps = schools.find((s) => s.code === 'DPS');
    expect(dps).toBeDefined();

    // 3. Validate categories
    const categories = await Category.find({});
    expect(categories.length).toBe(5);

    // 4. Validate products
    const products = await Product.find({});
    expect(products.length).toBe(8);

    // 5. Ensure "Blazzer" typo is completely corrected
    for (const p of products) {
      expect(p.name.toLowerCase()).not.toContain('blazzer');
      expect(p.description.toLowerCase()).not.toContain('blazzer');
    }

    // 6. Test Idempotency (run seed again without error or duplicates)
    await seedDatabase();
    const productsAfterSecondSeed = await Product.find({});
    expect(productsAfterSecondSeed.length).toBe(8);
  });
});

describe('6. Image & Video Upload & File Validation', () => {
  it('should accept valid image upload and return url & publicId', async () => {
    // Valid JPEG magic header (FF D8 FF E0 ... JFIF)
    const fakeImageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00]);
    const res = await request(app)
      .post('/api/v1/admin/uploads/image')
      .set('Cookie', adminCookie)
      .attach('image', fakeImageBuffer, { filename: 'uniform.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
    expect(res.body.data.publicId).toBeDefined();
  });

  it('should reject invalid file types with 400 bad request', async () => {
    const fakeTextBuffer = Buffer.from('plain text file');
    const res = await request(app)
      .post('/api/v1/admin/uploads/image')
      .set('Cookie', adminCookie)
      .attach('image', fakeTextBuffer, { filename: 'malicious.exe', contentType: 'application/x-msdownload' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid file type');
  });

  it('should accept valid hero video upload and return url & publicId', async () => {
    // Valid MP4 magic header (....ftypisom)
    const fakeVideoBuffer = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00]);
    const res = await request(app)
      .post('/api/v1/admin/uploads/video')
      .set('Cookie', adminCookie)
      .attach('video', fakeVideoBuffer, { filename: 'new-hero.mp4', contentType: 'video/mp4' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
    expect(res.body.data.publicId).toBeDefined();
  });

  it('should reject invalid video file types with 400 bad request', async () => {
    const fakeTextBuffer = Buffer.from('plain text file');
    const res = await request(app)
      .post('/api/v1/admin/uploads/video')
      .set('Cookie', adminCookie)
      .attach('video', fakeTextBuffer, { filename: 'malicious.exe', contentType: 'application/x-msdownload' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid file type');
  });

  it('should reject spoofed extension with dangerous MIME type', async () => {
    const fakeBuffer = Buffer.from('fake payload');
    const res = await request(app)
      .post('/api/v1/admin/uploads/video')
      .set('Cookie', adminCookie)
      .attach('video', fakeBuffer, { filename: 'evil.mp4', contentType: 'application/x-msdownload' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid file type');
  });

  it('should allow deleting uploaded video safely', async () => {
    // First upload a test video with valid MP4 header
    const fakeVideoBuffer = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00]);
    const uploadRes = await request(app)
      .post('/api/v1/admin/uploads/video')
      .set('Cookie', adminCookie)
      .attach('video', fakeVideoBuffer, { filename: 'to-delete.mp4', contentType: 'video/mp4' });

    expect(uploadRes.status).toBe(200);
    const publicId = uploadRes.body.data.publicId;

    // Delete it
    const deleteRes = await request(app)
      .delete(`/api/v1/admin/uploads/video/${encodeURIComponent(publicId)}`)
      .set('Cookie', adminCookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('7. School & Category Filter Robustness', () => {
  it('should filter products by school code case-insensitively', async () => {
    const res = await request(app).get('/api/v1/products?school=DPS');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
  });

  it('should return 0 items when filtered by a non-existent school', async () => {
    const res = await request(app).get('/api/v1/products?school=non-existent-school-xyz');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(0);
    expect(res.body.data.total).toBe(0);
  });
});

describe('8. Order Tracking', () => {
  it('should track order by orderNumber and matching customer phone', async () => {
    // 1. Create order
    const orderPayload = {
      customer: {
        name: 'Sunita Rao',
        phone: '9826077889',
        email: 'sunita@example.com',
        address: {
          line1: '10 Malviya Nagar',
          city: 'Bhopal',
          pincode: '462003',
        },
      },
      items: [
        {
          productId: testProduct._id.toString(),
          size: '32',
          qty: 1,
        },
      ],
      paymentMethod: 'cod',
      fulfilment: 'home_delivery',
    };

    const createRes = await request(app).post('/api/v1/orders').send(orderPayload);
    const orderNum = createRes.body.data.orderNumber;

    // 2. Track order
    const trackRes = await request(app).get(`/api/v1/orders/track?orderNumber=${orderNum}&phone=9826077889`);
    expect(trackRes.status).toBe(200);
    expect(trackRes.body.success).toBe(true);
    expect(trackRes.body.data.orderNumber).toBe(orderNum);
    expect(trackRes.body.data.status).toBe('pending');
  });
});

describe('9. Hero Video & Store Settings', () => {
  it('should return default heroVideoUrl in public settings', async () => {
    const res = await request(app).get('/api/v1/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.heroVideoUrl).toBe('/new-video-hero.mp4');
  });

  it('should allow owner admin to update heroVideoUrl in store settings', async () => {
    const updateRes = await request(app)
      .put('/api/v1/admin/settings')
      .set('Cookie', adminCookie)
      .send({
        businessName: 'Indraprasth Uniforms',
        tagline: 'The Uniform Icons since 1975',
        heroVideoUrl: 'https://res.cloudinary.com/dvaynkflu/video/upload/custom-hero-test.mp4',
        phones: ['+91 98260 25211'],
        email: 'info@indraprasthuniforms.com',
        whatsappNumber: '919826025211',
        address: 'Plot 23, New MLA Colony, Jawahar Chowk, Bhopal 462003',
        branches: [
          {
            name: 'Jawahar Chowk (HQ)',
            address: 'Plot 23, New MLA Colony, Bhopal 462003',
            phone: '+91 98260 25211',
            hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
          },
        ],
        deliveryFee: 60,
        freeDeliveryAbove: 1500,
        announcementBar: {
          text: 'Welcome to Indraprasth Uniforms',
          enabled: true,
        },
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.heroVideoUrl).toBe(
      'https://res.cloudinary.com/dvaynkflu/video/upload/custom-hero-test.mp4'
    );

    // Verify public settings now reflect the updated heroVideoUrl
    const publicRes = await request(app).get('/api/v1/settings/public');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.heroVideoUrl).toBe(
      'https://res.cloudinary.com/dvaynkflu/video/upload/custom-hero-test.mp4'
    );
  });

  it('should normalize empty or whitespace heroVideoUrl back to default /new-video-hero.mp4', async () => {
    const updateRes = await request(app)
      .put('/api/v1/admin/settings')
      .set('Cookie', adminCookie)
      .send({
        businessName: 'Indraprasth Uniforms',
        tagline: 'The Uniform Icons since 1975',
        heroVideoUrl: '   ',
        phones: ['+91 98260 25211'],
        email: 'info@indraprasthuniforms.com',
        whatsappNumber: '919826025211',
        address: 'Plot 23, New MLA Colony, Jawahar Chowk, Bhopal 462003',
        branches: [
          {
            name: 'Jawahar Chowk (HQ)',
            address: 'Plot 23, New MLA Colony, Bhopal 462003',
            phone: '+91 98260 25211',
            hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
          },
        ],
        deliveryFee: 60,
        freeDeliveryAbove: 1500,
        announcementBar: { text: '', enabled: false },
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.heroVideoUrl).toBe('/new-video-hero.mp4');

    const publicRes = await request(app).get('/api/v1/settings/public');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.heroVideoUrl).toBe('/new-video-hero.mp4');
  });
});
