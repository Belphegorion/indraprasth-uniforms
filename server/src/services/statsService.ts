import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { StatsResponse, OrderStatus } from '@indraprasth/shared';

export const getAdminStats = async (): Promise<StatsResponse> => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Order and Revenue aggregates
  const allOrders = await Order.find({ status: { $ne: 'cancelled' } }).lean();

  let revenueToday = 0;
  let revenue7Days = 0;
  let revenue30Days = 0;
  let revenueTotal = 0;

  let ordersToday = 0;
  let orders7Days = 0;
  let orders30Days = 0;
  let ordersTotal = allOrders.length;

  for (const o of allOrders) {
    const createdAt = new Date(o.createdAt);
    const total = o.total || 0;

    revenueTotal += total;

    if (createdAt >= startOfToday) {
      revenueToday += total;
      ordersToday++;
    }
    if (createdAt >= sevenDaysAgo) {
      revenue7Days += total;
      orders7Days++;
    }
    if (createdAt >= thirtyDaysAgo) {
      revenue30Days += total;
      orders30Days++;
    }
  }

  // 2. Status counts
  const rawStatusCounts = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const defaultStatuses: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    packed: 0,
    out_for_delivery: 0,
    ready_for_pickup: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const item of rawStatusCounts) {
    if (item._id in defaultStatuses) {
      defaultStatuses[item._id as OrderStatus] = item.count;
    }
  }

  // 3. Top 5 selling products
  const topProductsRaw = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.nameSnapshot' },
        image: { $first: '$items.image' },
        totalQty: { $sum: '$items.qty' },
        totalRevenue: {
          $sum: { $multiply: ['$items.priceSnapshot', '$items.qty'] },
        },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
  ]);

  const topProducts = topProductsRaw.map((p) => ({
    productId: p._id?.toString() || '',
    name: p.name || 'Product',
    totalQty: p.totalQty,
    totalRevenue: p.totalRevenue,
    image: p.image,
  }));

  // 4. Low-stock products (< 10 units in any size)
  const allActiveProducts = await Product.find({ isActive: true }).lean();
  const lowStockProducts: Array<{
    productId: string;
    name: string;
    size: string;
    stock: number;
  }> = [];

  for (const prod of allActiveProducts) {
    for (const size of prod.sizes) {
      if (size.stock <= 10) {
        lowStockProducts.push({
          productId: prod._id.toString(),
          name: prod.name,
          size: size.label,
          stock: size.stock,
        });
      }
    }
  }
  lowStockProducts.sort((a, b) => a.stock - b.stock);

  // 5. Chart Data (last 30 days)
  const chartMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    chartMap.set(dateStr, { orders: 0, revenue: 0 });
  }

  for (const o of allOrders) {
    const dStr = new Date(o.createdAt).toISOString().slice(0, 10);
    if (chartMap.has(dStr)) {
      const entry = chartMap.get(dStr)!;
      entry.orders += 1;
      entry.revenue += o.total || 0;
    }
  }

  const chartData = Array.from(chartMap.entries()).map(([date, val]) => ({
    date,
    orders: val.orders,
    revenue: val.revenue,
  }));

  return {
    revenue: {
      today: revenueToday,
      last7Days: revenue7Days,
      last30Days: revenue30Days,
      total: revenueTotal,
    },
    ordersCount: {
      today: ordersToday,
      last7Days: orders7Days,
      last30Days: orders30Days,
      total: ordersTotal,
    },
    statusCounts: defaultStatuses,
    topProducts,
    lowStockProducts: lowStockProducts.slice(0, 10),
    chartData,
  };
};
