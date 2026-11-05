import mongoose, { Schema, Document, Model } from 'mongoose';
import { InquiryType, InquiryStatus } from '@indraprasth/shared';

export interface IInquiryDocument extends Document {
  type: InquiryType;
  name: string;
  phone: string;
  email?: string;
  organisation?: string;
  message: string;
  quantityEstimate?: number;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiryDocument>(
  {
    type: {
      type: String,
      enum: ['contact', 'bulk'],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    organisation: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    quantityEstimate: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true,
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

export const Inquiry: Model<IInquiryDocument> = mongoose.model<IInquiryDocument>(
  'Inquiry',
  inquirySchema
);
