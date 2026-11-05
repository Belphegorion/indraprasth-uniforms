import mongoose, { Schema, Document, Model } from 'mongoose';
import { IBranch, IAnnouncementBar, ISocialLinks } from '@indraprasth/shared';

export interface ISettingDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    hours: { type: String, required: true },
    mapUrl: { type: String },
  },
  { _id: false }
);

const settingSchema = new Schema<ISettingDocument>(
  {
    businessName: { type: String, default: 'Indraprasth Uniforms' },
    tagline: { type: String, default: 'The Uniform Icons since 1975' },
    logoUrl: { type: String },
    phones: {
      type: [String],
      default: ['+91 98260 25211', '+91 755 2770244'],
    },
    email: { type: String, default: 'info@indraprasthuniforms.com' },
    whatsappNumber: { type: String, default: '919826025211' },
    address: {
      type: String,
      default: 'Plot 23, New MLA Colony, near Unique College, Jawahar Chowk, Bhopal 462003',
    },
    branches: {
      type: [branchSchema],
      default: [
        {
          name: 'Jawahar Chowk (HQ)',
          address: 'Plot 23, New MLA Colony, near Unique College, Bhopal 462003',
          phone: '+91 98260 25211',
          hours: 'Mon-Sat: 10:30 AM - 8:30 PM, Sun: 11:00 AM - 4:00 PM',
          mapUrl: 'https://maps.google.com/?q=Jawahar+Chowk+Bhopal',
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
          mapUrl: 'https://maps.google.com/?q=Gandhi+Market+Piplani+Bhopal',
        },
        {
          name: 'Karond',
          address: 'Opp. Atal Multi Speciality Hospital, Karond Bypass Rd, Bhopal 462038',
          phone: '+91 98260 25214',
          hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
          mapUrl: 'https://maps.google.com/?q=Karond+Bypass+Road+Bhopal',
        },
      ],
    },
    deliveryFee: { type: Number, default: 60 },
    freeDeliveryAbove: { type: Number, default: 1500 },
    announcementBar: {
      text: {
        type: String,
        default: '🎒 School Session 2026-27 Bookings Open! Free delivery across Bhopal on orders above ₹1,500.',
      },
      enabled: { type: Boolean, default: true },
      link: { type: String, default: '/shop' },
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/indraprasthuniforms' },
      instagram: { type: String, default: 'https://instagram.com/indraprasthuniforms' },
      twitter: { type: String },
      youtube: { type: String },
    },
    gstin: { type: String, default: '23AAAAA0000A1Z5' },
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

export interface ISettingModel extends Model<ISettingDocument> {
  getSettings(): Promise<ISettingDocument>;
}

settingSchema.statics.getSettings = async function (): Promise<ISettingDocument> {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

export const Setting = mongoose.model<ISettingDocument, ISettingModel>(
  'Setting',
  settingSchema
);
