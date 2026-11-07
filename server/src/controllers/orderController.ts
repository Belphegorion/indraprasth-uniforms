import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { createOrder, updateOrderStatus } from '../services/orderService';
import { Parser } from 'json2csv';
import { AuthRequest } from '../middleware/auth';

export const createPublicOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        customer: order.customer,
        createdAt: order.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to place order' });
  }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  const { orderNumber, phone } = req.query as { orderNumber: string; phone: string };

  if (!orderNumber || !phone) {
    res.status(400).json({
      success: false,
      error: 'Please provide both orderNumber and phone to track your order',
    });
    return;
  }

  // Clean phone input (must have 10 digits)
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    res.status(400).json({
      success: false,
      error: 'Please provide a valid 10-digit phone number',
    });
    return;
  }

  const order = await Order.findOne({
    orderNumber: orderNumber.trim(),
    'customer.phone': { $regex: cleanPhone + '$' },
  }).lean();

  if (!order) {
    res.status(404).json({
      success: false,
      error: 'No order found matching this order number and phone number',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      fulfilment: order.fulfilment,
      pickupBranch: order.pickupBranch,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    },
  });
};

// Admin Endpoints
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  const {
    q,
    status,
    paymentStatus,
    fulfilment,
    page = 1,
    limit = 20,
  } = req.query as any;

  const filter: any = {};

  if (q && typeof q === 'string' && q.trim().length > 0) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { orderNumber: searchRegex },
      { 'customer.phone': searchRegex },
      { 'customer.name': searchRegex },
    ];
  }

  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (fulfilment) filter.fulfilment = fulfilment;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: orders,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.status(200).json({ success: true, data: order });
};

export const patchOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, note } = req.body;
  const adminName = req.user?.name || 'Admin';

  try {
    const updated = await updateOrderStatus(id, status, adminName, note);
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update order status' });
  }
};

export const exportOrdersCsv = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const sanitizeCell = (val: any): any => {
      if (typeof val === 'string' && /^[=+\-@\t\r]/.test(val)) {
        return `'${val}`;
      }
      return val;
    };

    const flatOrders = orders.map((o) => {
      const row = {
        OrderNumber: o.orderNumber,
        Date: new Date(o.createdAt).toLocaleString('en-IN'),
        CustomerName: o.customer.name,
        Phone: o.customer.phone,
        Email: o.customer.email || '',
        Fulfilment: o.fulfilment,
        PickupBranch: o.pickupBranch || '',
        Address: o.customer.address ? `${o.customer.address.line1}, ${o.customer.address.city} - ${o.customer.address.pincode}` : '',
        Status: o.status,
        PaymentMethod: o.paymentMethod,
        PaymentStatus: o.paymentStatus,
        Subtotal: o.subtotal,
        DeliveryFee: o.deliveryFee,
        Total: o.total,
        ItemCount: o.items.length,
        ItemDetails: o.items.map((i) => `${i.nameSnapshot} (${i.size}) x${i.qty}`).join('; '),
      };
      const sanitizedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        sanitizedRow[key] = sanitizeCell(value);
      }
      return sanitizedRow;
    });

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(flatOrders);

    res.header('Content-Type', 'text/csv');
    res.attachment(`indraprasth_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'CSV export failed' });
  }
};
