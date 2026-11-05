import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounterDocument extends Document {
  name: string;
  seq: number;
}

const counterSchema = new Schema<ICounterDocument>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export interface ICounterModel extends Model<ICounterDocument> {
  getNextOrderNumber(prefix?: string): Promise<string>;
}

counterSchema.statics.getNextOrderNumber = async function (
  prefix = 'IU'
): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const counterName = `order_${dateStr}`;

  const counter = await this.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqStr = String(counter.seq).padStart(4, '0');
  return `${prefix}-${dateStr}-${seqStr}`;
};

export const Counter = mongoose.model<ICounterDocument, ICounterModel>(
  'Counter',
  counterSchema
);
