import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const schoolCreateSchema = z.object({
  name: z.string().min(2, 'School name is required'),
  code: z.string().min(2, 'Code is required').toUpperCase(),
  slug: z.string().min(2, 'Slug is required').toLowerCase(),
  branchLabel: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const schoolUpdateSchema = schoolCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required').toLowerCase(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const productImageSchema = z.object({
  url: z.string().url('Valid image URL required'),
  publicId: z.string().min(1, 'Public ID required'),
});

export const productSizeSchema = z.object({
  label: z.string().min(1, 'Size label is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
});

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required').toLowerCase(),
  description: z.string().min(5, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  mrp: z.number().positive('MRP must be greater than 0').optional(),
  school: z.string().min(1, 'School ID is required'),
  category: z.string().min(1, 'Category ID is required'),
  images: z.array(productImageSchema).min(1, 'At least one image is required'),
  sizes: z.array(productSizeSchema).min(1, 'At least one size is required'),
  gender: z.enum(['boys', 'girls', 'unisex']).default('unisex'),
  season: z.enum(['winter', 'summer', 'all']).default('all'),
  typeGroup: z.enum(['tops', 'bottoms', 'footwear', 'outerwear', 'accessories']).default('tops'),
  itemType: z.string().min(1, 'Item type is required').default('Shirt'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sku: z.string().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productQuerySchema = z.object({
  q: z.string().optional(),
  school: z.string().optional(),
  category: z.string().optional(),
  gender: z.enum(['boys', 'girls', 'unisex']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'name_asc', 'featured']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Helper for array query params that handles string, array, or comma-separated string
const arrayQueryParam = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.includes(',') ? val.split(',').map((s) => s.trim()) : [val.trim()];
  }
  return [];
}, z.array(z.string()).default([]));

export const productBrowseQuerySchema = z.object({
  school: z.string().optional(),
  q: z.string().max(80, 'Search query cannot exceed 80 characters').optional(),
  gender: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.includes(',') ? val.split(',').map((s) => s.trim().toLowerCase()) : [val.trim().toLowerCase()];
    }
    return [];
  }, z.array(z.enum(['boys', 'girls', 'unisex'])).default([])),
  season: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.includes(',') ? val.split(',').map((s) => s.trim().toLowerCase()) : [val.trim().toLowerCase()];
    }
    return [];
  }, z.array(z.enum(['winter', 'summer', 'all'])).default([])),
  typeGroup: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.includes(',') ? val.split(',').map((s) => s.trim().toLowerCase()) : [val.trim().toLowerCase()];
    }
    return [];
  }, z.array(z.enum(['tops', 'bottoms', 'footwear', 'outerwear', 'accessories'])).default([])),
  itemType: arrayQueryParam,
  size: arrayQueryParam,
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    return undefined;
  }, z.boolean().optional()),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'name_asc']).default('relevance'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(48).default(12),
});

export type ProductBrowseQuery = z.infer<typeof productBrowseQuerySchema>;

export const customerAddressSchema = z.object({
  line1: z.string().min(3, 'Address line 1 is required'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Bhopal/Indian PIN code'),
});

export const customerInputSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: customerAddressSchema.optional(),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  size: z.string().min(1, 'Size is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Max 20 per item'),
});

export const orderCreateSchema = z.object({
  customer: customerInputSchema,
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['cod', 'pay_at_store', 'online']),
  fulfilment: z.enum(['home_delivery', 'store_pickup']),
  pickupBranch: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.fulfilment === 'home_delivery') {
      return !!data.customer.address && !!data.customer.address.line1 && !!data.customer.address.city && !!data.customer.address.pincode;
    }
    return true;
  },
  {
    message: 'Delivery address is required for home delivery',
    path: ['customer', 'address'],
  }
).refine(
  (data) => {
    if (data.fulfilment === 'store_pickup') {
      return !!data.pickupBranch && data.pickupBranch.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Please choose a branch for store pickup',
    path: ['pickupBranch'],
  }
);

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'packed',
    'out_for_delivery',
    'ready_for_pickup',
    'completed',
    'cancelled',
  ]),
  note: z.string().max(500).optional(),
});

export const orderTrackQuerySchema = z.object({
  orderNumber: z.string().min(3, 'Order number is required'),
  phone: z.string().min(10, 'Phone number is required'),
});

export const inquiryCreateSchema = z.object({
  type: z.enum(['contact', 'bulk']),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  organisation: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  quantityEstimate: z.coerce.number().int().positive().optional(),
});

export const inquiryStatusUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(7, 'Phone number is required'),
  hours: z.string().min(3, 'Business hours required'),
  mapUrl: z.string().url().optional().or(z.literal('')),
});

export const settingUpdateSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  tagline: z.string().min(2, 'Tagline is required'),
  logoUrl: z.string().optional(),
  phones: z.array(z.string()).min(1, 'At least one phone number is required'),
  email: z.string().email('Valid email required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number required'),
  address: z.string().min(5, 'Head office address required'),
  branches: z.array(branchSchema).min(1, 'At least one branch is required'),
  deliveryFee: z.number().min(0, 'Delivery fee cannot be negative'),
  freeDeliveryAbove: z.number().min(0, 'Free delivery threshold cannot be negative'),
  announcementBar: z.object({
    text: z.string(),
    enabled: z.boolean(),
    link: z.string().optional(),
  }),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  gstin: z.string().optional(),
});
