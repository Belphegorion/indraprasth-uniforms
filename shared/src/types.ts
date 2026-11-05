export type AdminRole = 'owner' | 'staff';

export interface IAdmin {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ISchool {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  slug: string;
  branchLabel?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ICategory {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProductSize {
  label: string;
  stock: number;
}

export type ProductGender = 'boys' | 'girls' | 'unisex';
export type ProductSeason = 'winter' | 'summer' | 'all';
export type ProductTypeGroup = 'tops' | 'bottoms' | 'footwear' | 'outerwear' | 'accessories';

export const TYPE_GROUPS = ['tops', 'bottoms', 'footwear', 'outerwear', 'accessories'] as const;
export const SEASONS = ['winter', 'summer', 'all'] as const;
export const GENDERS = ['boys', 'girls', 'unisex'] as const;

export const ITEM_TYPES_BY_GROUP: Record<ProductTypeGroup, string[]> = {
  tops: ['Shirt', 'T-shirt', 'Kurta', 'Upper', 'Polo'],
  bottoms: ['Pant', 'Skirt', 'Divider', 'Pinafore', 'Shorts', 'Track Pant'],
  footwear: ['Shoes', 'Socks'],
  outerwear: ['Blazer', 'Sweater', 'Jacket', 'Cardigan', 'Coat'],
  accessories: ['Tie', 'Belt', 'Cap', 'Bag', 'Apron', 'Scarf', 'Badge'],
};

export const ALL_ITEM_TYPES = Object.values(ITEM_TYPES_BY_GROUP).flat();

export interface IProduct {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp?: number;
  school: ISchool | string;
  category: ICategory | string;
  images: IProductImage[];
  sizes: IProductSize[];
  gender: ProductGender;
  season?: ProductSeason;
  typeGroup?: ProductTypeGroup;
  itemType?: string;
  isActive: boolean;
  isFeatured: boolean;
  sku?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type PaymentMethod = 'cod' | 'pay_at_store' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfilmentType = 'home_delivery' | 'store_pickup';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface IOrderItem {
  product: string; // product ID
  nameSnapshot: string;
  priceSnapshot: number;
  size: string;
  qty: number;
  image: string;
}

export interface ICustomerAddress {
  line1: string;
  city: string;
  pincode: string;
}

export interface ICustomer {
  name: string;
  phone: string;
  email?: string;
  address?: ICustomerAddress;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  at: string | Date;
  by: string;
  note?: string;
}

export interface IOrder {
  id?: string;
  _id?: string;
  orderNumber: string;
  customer: ICustomer;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfilment: FulfilmentType;
  pickupBranch?: string;
  status: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type InquiryType = 'contact' | 'bulk';
export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface IInquiry {
  id?: string;
  _id?: string;
  type: InquiryType;
  name: string;
  phone: string;
  email?: string;
  organisation?: string;
  message: string;
  quantityEstimate?: number;
  status: InquiryStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IBranch {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl?: string;
}

export interface IAnnouncementBar {
  text: string;
  enabled: boolean;
  link?: string;
}

export interface ISocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface ISetting {
  businessName: string;
  tagline: string;
  logoUrl?: string;
  phones: string[];
  email: string;
  whatsappNumber: string;
  address: string;
  branches: IBranch[];
  deliveryFee: number;
  freeDeliveryAbove: number;
  announcementBar: IAnnouncementBar;
  socialLinks?: ISocialLinks;
  gstin?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// API Envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsResponse {
  revenue: {
    today: number;
    last7Days: number;
    last30Days: number;
    total: number;
  };
  ordersCount: {
    today: number;
    last7Days: number;
    last30Days: number;
    total: number;
  };
  statusCounts: Record<OrderStatus, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    totalQty: number;
    totalRevenue: number;
    image?: string;
  }>;
  lowStockProducts: Array<{
    productId: string;
    name: string;
    size: string;
    stock: number;
  }>;
  chartData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export interface IBrowseFacetValue {
  value: string;
  count: number;
}

export interface IBrowseFacets {
  gender: IBrowseFacetValue[];
  season: IBrowseFacetValue[];
  typeGroup: IBrowseFacetValue[];
  itemType: IBrowseFacetValue[];
  size: IBrowseFacetValue[];
  price: { min: number; max: number };
}

export interface IBrowseData {
  items: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  facets: IBrowseFacets;
}

export interface IBrowseFilterState {
  school?: string;
  q?: string;
  gender: ProductGender[];
  season: ProductSeason[];
  typeGroup: ProductTypeGroup[];
  itemType: string[];
  size: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  page: number;
}
