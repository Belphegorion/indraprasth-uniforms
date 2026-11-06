import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProductGender, ProductSeason, ProductTypeGroup, IProductImage, IProductSize, IProductVariant } from '@indraprasth/shared';

export interface IProductDocument extends Document {
  name: string;
  originalName?: string;
  slug: string;
  description: string;
  price: number;
  mrp?: number;
  school: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  images: IProductImage[];
  sizes: IProductSize[];
  variants?: IProductVariant[];
  gender: ProductGender;
  season: ProductSeason;
  typeGroup: ProductTypeGroup;
  itemType: string;
  isActive: boolean;
  isFeatured: boolean;
  sku?: string;
  importSource?: {
    file: string;
    productNo: number;
    importedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSizeSchema = new Schema<IProductSize>(
  {
    label: { type: String, required: true },
    originalLabel: { type: String },
    price: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    gradeRange: { type: String },
    unit: { type: String },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    colorName: { type: String, required: true },
    colorHex: { type: String },
    images: { type: [productImageSchema], default: [] },
    sizes: { type: [productSizeSchema], default: [] },
  },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    images: {
      type: [productImageSchema],
      required: true,
      validate: [(v: IProductImage[]) => v.length > 0, 'At least one image is required'],
    },
    sizes: {
      type: [productSizeSchema],
      default: [],
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    gender: {
      type: String,
      enum: ['boys', 'girls', 'unisex'],
      default: 'unisex',
      required: true,
    },
    season: {
      type: String,
      enum: ['winter', 'summer', 'all'],
      default: 'all',
      index: true,
    },
    typeGroup: {
      type: String,
      enum: ['tops', 'bottoms', 'footwear', 'outerwear', 'accessories'],
      default: 'tops',
      index: true,
    },
    itemType: {
      type: String,
      required: true,
      default: 'Shirt',
      trim: true,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sku: { type: String, trim: true, sparse: true, index: true },
    importSource: {
      file: { type: String },
      productNo: { type: Number },
      importedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ school: 1, category: 1, isActive: 1 });
productSchema.index({ school: 1, isActive: 1, typeGroup: 1, season: 1, gender: 1, price: 1 });

export const Product: Model<IProductDocument> = mongoose.model<IProductDocument>(
  'Product',
  productSchema
);
