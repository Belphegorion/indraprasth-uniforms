import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  PaymentMethod,
  PaymentStatus,
  FulfilmentType,
  OrderStatus,
  IOrderItem,
  ICustomer,
  IOrderStatusHistory,
} from '@indraprasth/shared';

export interface IOrderDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: {
      line1: { type: String, trim: true },
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: String, required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    size: { type: String, required: true },
    color: { type: String },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'packed',
        'out_for_delivery',
        'ready_for_pickup',
        'completed',
        'cancelled',
      ],
      required: true,
    },
    at: { type: Date, default: Date.now },
    by: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, 'At least one item is required'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cod', 'pay_at_store', 'online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      required: true,
    },
    fulfilment: {
      type: String,
      enum: ['home_delivery', 'store_pickup'],
      required: true,
    },
    pickupBranch: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'packed',
        'out_for_delivery',
        'ready_for_pickup',
        'completed',
        'cancelled',
      ],
      default: 'pending',
      index: true,
      required: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    notes: { type: String, trim: true },
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

orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ createdAt: -1 });

export const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', orderSchema);
