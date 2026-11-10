import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../config/db';
import { School } from '../models/School';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Setting } from '../models/Setting';
import { createOrUpdateAdmin } from './createAdmin';
import { inferProductFilters } from './migrateFilters';

// Fix typos like "Blazzer" -> "Blazer"
const fixTypo = (str: string): string => {
  return str.replace(/blazzer/gi, 'Blazer');
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding for Indraprasth Uniforms...');

  // 1. Seed / Upsert Schools (7 canonical Bhopal partner institutions)
  const schoolsData = [
    {
      name: 'Delhi Public School Bhopal',
      code: 'DPS',
      slug: 'dps-bhopal',
      branchLabel: 'Bhadbhada Road',
      logoUrl: '/school-logos/dps.webp',
      isActive: true,
    },
    {
      name: 'Delhi Public School Kolar Road',
      code: 'DPS KOLAR',
      slug: 'dps-kolar',
      branchLabel: 'Kolar Road',
      logoUrl: '/school-logos/dps.webp',
      isActive: true,
    },
    {
      name: 'The Sanskaar Valley School',
      code: 'TSVS',
      slug: 'the-sanskaar-valley-school',
      branchLabel: 'Bhopal',
      logoUrl: '/school-logos/tsvs.webp',
      isActive: true,
    },
    {
      name: 'St Joseph Higher Secondary School',
      code: 'JSS',
      slug: 'st-joseph-higher-secondary-school',
      branchLabel: 'Idgah Hills',
      logoUrl: '/school-logos/jss.webp',
      isActive: true,
    },
    {
      name: 'IES Public School',
      code: 'IES',
      slug: 'ies-public-school',
      branchLabel: 'Bhopal',
      logoUrl: '/school-logos/ies.webp',
      isActive: true,
    },
    {
      name: 'Sagar Public School',
      code: 'SPS',
      slug: 'sps-bhopal',
      branchLabel: 'Saket Nagar',
      logoUrl: '/school-logos/sps.webp',
      isActive: true,
    },
    {
      name: 'Billabong High International School',
      code: 'BHIS',
      slug: 'billabong-high-international-school',
      branchLabel: 'Bhopal',
      logoUrl: '/school-logos/bhis.webp',
      isActive: true,
    },
  ];

  const schoolMap = new Map<string, any>();
  for (const s of schoolsData) {
    const doc = await School.findOneAndUpdate(
      { code: s.code },
      { $set: s },
      { upsert: true, new: true }
    );
    schoolMap.set(s.code, doc);
    console.log(`🏫 School synced: ${s.name} [${s.code}]`);
  }

  // 2. Seed / Upsert Categories
  const categoriesData = [
    {
      name: 'Winter-ware',
      slug: 'winter-ware',
      description: 'Official winter blazers, sweaters, track uppers, thermal shirts & pants',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Summer-ware',
      slug: 'summer-ware',
      description: 'Summer shirts, shorts, trousers, tunics and pinafores',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'School ties, belts, socks, crest badges, and winter gloves',
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Hospital',
      slug: 'hospital',
      description: 'Medical scrubs, doctor coats, lab aprons and patient attire',
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Corporate',
      slug: 'corporate',
      description: 'Executive corporate shirts, industrial uniforms and bespoke blazers',
      sortOrder: 5,
      isActive: true,
    },
  ];

  const categoryMap = new Map<string, any>();
  for (const c of categoriesData) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: c },
      { upsert: true, new: true }
    );
    categoryMap.set(c.name, doc);
    console.log(`📁 Category synced: ${c.name}`);
  }

  // 3. Seed / Upsert Products from products.json
  let productsFilePath = path.join(__dirname, '../data/products.json');
  if (!fs.existsSync(productsFilePath)) {
    productsFilePath = path.join(__dirname, '../../src/data/products.json');
  }
  if (!fs.existsSync(productsFilePath)) {
    productsFilePath = path.resolve(process.cwd(), 'src/data/products.json');
  }

  if (fs.existsSync(productsFilePath)) {
    const rawData = fs.readFileSync(productsFilePath, 'utf-8');
    const productsData: any[] = JSON.parse(rawData);

    for (const item of productsData) {
      // Fix typos such as "Blazzer" -> "Blazer"
      const correctedName = fixTypo(item.name);
      const correctedDescription = fixTypo(item.description || '');
      const slug = slugify(correctedName);

      const school = schoolMap.get(item.schoolCode) || schoolMap.get('DPS');
      const category = categoryMap.get(item.category) || categoryMap.get('Winter-ware');

      const inferred = inferProductFilters(correctedName, correctedDescription);
      const season = item.season || inferred.season;
      const typeGroup = item.typeGroup || inferred.typeGroup;
      const itemType = item.itemType || inferred.itemType;

      const productPayload = {
        name: correctedName,
        slug,
        description: correctedDescription || `${correctedName} made with premium fabric for durability and shape retention.`,
        price: item.price,
        mrp: Math.round(item.price * 1.15), // 15% display MRP for discount badge
        school: school._id,
        category: category._id,
        images: [
          {
            url: item.imageUrl,
            publicId: item.publicId || `indraprasth/products/${slug}`,
          },
        ],
        sizes: item.sizes && item.sizes.length > 0 ? item.sizes : [{ label: 'Standard', stock: 25 }],
        gender: item.gender || 'unisex',
        season,
        typeGroup,
        itemType,
        isActive: true,
        isFeatured: item.isFeatured ?? true,
        sku: `IU-${item.schoolCode.replace(/\s+/g, '')}-${slug.slice(0, 10).toUpperCase()}`,
      };

      await Product.findOneAndUpdate(
        { slug },
        { $set: productPayload },
        { upsert: true, new: true }
      );
      console.log(`👕 Product synced: ${correctedName} (₹${item.price})`);
    }
  }

  // 4. Seed / Upsert Settings
  const settingsData = {
    businessName: 'Indraprasth Uniforms',
    tagline: 'The Uniform Icons since 1975',
    logoUrl: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1791284239/indraprasth/products/y3sgf8q8kydtlarcydnb.jpg',
    heroVideoUrl: '/new-video-hero.mp4',
    phones: ['+91 98260 25211', '+91 755 2770244'],
    email: 'info@indraprasthuniforms.com',
    whatsappNumber: '919826025211',
    address: 'Plot 23, New MLA Colony, near Unique College, Jawahar Chowk, Bhopal 462003',
    branches: [
      {
        name: 'Jawahar Chowk (HQ)',
        address: 'Plot 23, New MLA Colony, near Unique College, Bhopal 462003',
        phone: '+91 98260 25211',
        hours: 'Mon-Sat: 10:30 AM - 8:30 PM, Sun: 11:00 AM - 4:00 PM',
        mapUrl: 'https://maps.google.com/?q=Plot+23+New+MLA+Colony+Jawahar+Chowk+Bhopal',
      },
      {
        name: 'Kolar Road',
        address: 'Shop 14, Ultimate Arcade, Kolar Road, Bhopal 462042',
        phone: '+91 98260 25212',
        hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
        mapUrl: 'https://maps.google.com/?q=Ultimate+Arcade+Kolar+Road+Bhopal',
      },
      {
        name: 'Piplani / BHEL',
        address: '68 Gandhi Market, Piplani, BHEL, Bhopal 462021',
        phone: '+91 98260 25213',
        hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
        mapUrl: 'https://maps.google.com/?q=68+Gandhi+Market+Piplani+Bhopal',
      },
      {
        name: 'Karond',
        address: 'Opp. Atal Multi Speciality Hospital, Karond Bypass Rd, Bhopal 462038',
        phone: '+91 98260 25214',
        hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
        mapUrl: 'https://maps.google.com/?q=Atal+Multi+Speciality+Hospital+Karond+Bypass+Road+Bhopal',
      },
    ],
    deliveryFee: 60,
    freeDeliveryAbove: 1500,
    announcementBar: {
      text: '🎒 New Academic Year Uniforms Available! Free Home Delivery across Bhopal on orders over ₹1,500.',
      enabled: true,
      link: '/shop',
    },
    socialLinks: {
      facebook: 'https://facebook.com/indraprasthuniforms',
      instagram: 'https://instagram.com/indraprasthuniforms',
      twitter: 'https://twitter.com/indraprasthuni',
      youtube: 'https://youtube.com/@indraprasthuniforms',
    },
    gstin: '23AAAAA0000A1Z5',
  };

  const existingSettings = await Setting.findOne();
  if (!existingSettings) {
    await Setting.create(settingsData);
    console.log('⚙️ Default settings and branches created');
  } else {
    if (!existingSettings.heroVideoUrl) {
      existingSettings.heroVideoUrl = '/new-video-hero.mp4';
      await existingSettings.save();
    }
    console.log('⚙️ Default settings and branches synced');
  }

  // 5. Seed Owner Admin
  await createOrUpdateAdmin();

  console.log('🎉 Seeding completed successfully!');
};

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  run();
}
