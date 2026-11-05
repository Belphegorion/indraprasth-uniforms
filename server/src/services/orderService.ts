import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Order, IOrderDocument } from '../models/Order';
import { Setting } from '../models/Setting';
import { Counter } from '../models/Counter';
import { OrderStatus, PaymentMethod, FulfilmentType } from '@indraprasth/shared';

export interface CreateOrderParams {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: {
      line1: string;
      city: string;
      pincode: string;
    };
  };
  items: Array<{
    productId: string;
    size: string;
    qty: number;
  }>;
  paymentMethod: PaymentMethod;
  fulfilment: FulfilmentType;
  pickupBranch?: string;
  notes?: string;
}

export const createOrder = async (params: CreateOrderParams): Promise<IOrderDocument> => {
  const { customer, items, paymentMethod, fulfilment, pickupBranch, notes } = params;

  // 1. Fetch products from DB
  const productIds = items.map((i) => i.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

  // 2. Pre-validate stock and build item snapshots
  const snapshots: Array<{
    product: string;
    nameSnapshot: string;
    priceSnapshot: number;
    size: string;
    qty: number;
    image: string;
  }> = [];

  let subtotal = 0;

  for (const item of items) {
    const p = productMap.get(item.productId);
    if (!p || !p.isActive) {
      throw new Error(`Product not found or inactive: ${item.productId}`);
    }

    const sizeObj = p.sizes.find((s) => s.label === item.size);
    if (!sizeObj) {
      throw new Error(`Size "${item.size}" does not exist for product "${p.name}"`);
    }

    if (sizeObj.stock < item.qty) {
      throw new Error(
        `Insufficient stock for "${p.name}" (Size: ${item.size}). Available: ${sizeObj.stock}, requested: ${item.qty}`
      );
    }

    const price = p.price;
    subtotal += price * item.qty;

    snapshots.push({
      product: p._id.toString(),
      nameSnapshot: p.name,
      priceSnapshot: price,
      size: item.size,
      qty: item.qty,
      image: p.images[0]?.url || '',
    });
  }

  // 3. Atomically decrement stock with compensation/rollback if any step fails
  const decremented: Array<{ productId: string; size: string; qty: number }> = [];

  const rollbackStock = async () => {
    for (const rollback of decremented) {
      await Product.updateOne(
        { _id: rollback.productId, 'sizes.label': rollback.size },
        { $inc: { 'sizes.$.stock': rollback.qty } }
      );
    }
  };

  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          'sizes.label': item.size,
          'sizes.stock': { $gte: item.qty },
        },
        {
          $inc: { 'sizes.$.stock': -item.qty },
        },
        { new: true }
      );

      if (!updated) {
        await rollbackStock();
        const p = productMap.get(item.productId);
        throw new Error(
          `Could not reserve stock for "${p?.name || item.productId}" size ${item.size}. It may have just sold out.`
        );
      }

      decremented.push(item);
    }

    // 4. Calculate delivery fee from settings
    const settings = await Setting.getSettings();
    let deliveryFee = 0;
    if (fulfilment === 'home_delivery') {
      if (subtotal < (settings.freeDeliveryAbove || 1500)) {
        deliveryFee = settings.deliveryFee || 60;
      }
    }

    const total = subtotal + deliveryFee;

    // 5. Generate human order number
    const orderNumber = await Counter.getNextOrderNumber();

    // 6. Create order record
    const order = await Order.create({
      orderNumber,
      customer,
      items: snapshots,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      fulfilment,
      pickupBranch: fulfilment === 'store_pickup' ? pickupBranch : undefined,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          at: new Date(),
          by: 'Customer',
          note: `Order created via ${fulfilment === 'store_pickup' ? 'Store Pickup' : 'Home Delivery'}`,
        },
      ],
      notes,
    });

    return order;
  } catch (err) {
    // If order creation or counter fails after some items were decremented, rollback everything
    await rollbackStock();
    throw err;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  updatedBy: string,
  note?: string
): Promise<IOrderDocument> => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const previousStatus = order.status;

  // Stock restoration on cancel
  if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'sizes.label': item.size },
        { $inc: { 'sizes.$.stock': item.qty } }
      );
    }
  }

  // Stock re-decrement if reactivated from cancelled
  if (previousStatus === 'cancelled' && newStatus !== 'cancelled') {
    for (const item of order.items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          'sizes.label': item.size,
          'sizes.stock': { $gte: item.qty },
        },
        { $inc: { 'sizes.$.stock': -item.qty } }
      );
      if (!updated) {
        throw new Error(
          `Cannot reactivate order: insufficient stock for product item "${item.nameSnapshot}" (${item.size})`
        );
      }
    }
  }

  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    at: new Date(),
    by: updatedBy,
    note: note || `Status updated to ${newStatus}`,
  });

  if (newStatus === 'completed' && order.paymentMethod !== 'online') {
    order.paymentStatus = 'paid';
  }

  await order.save();
  return order;
};
