import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Package,
  IndianRupee,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAdminStats, useAdminOrders } from '../../api';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentOrdersData, isLoading: ordersLoading } = useAdminOrders({
    page: 1,
    limit: 5,
  });

  const recentOrders = recentOrdersData?.items || [];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const pendingAttentionCount =
    (stats?.statusCounts?.pending || 0) + (stats?.statusCounts?.confirmed || 0);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Dashboard | Admin Portal - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 tracking-tight">
            Store Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate mt-1 font-sans">
            Real-time analytics, stock monitoring, and order fulfillment overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 font-bold text-xs shadow-sm transition-all btn-tactile"
          >
            <Package className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Revenue */}
        <div className="bg-cream-50 p-5 sm:p-6 rounded-xl border border-sand-300 shadow-sm relative overflow-hidden group hover:border-sand-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif uppercase tracking-wider text-slate font-bold">
              Today's Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-sans text-navy-800">
              ₹{(stats?.revenue.today || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate font-sans">
              <span className="text-success-text font-bold">
                {stats?.ordersCount.today || 0} orders
              </span>{' '}
              placed today
            </div>
          </div>
        </div>

        {/* 30-Day Revenue */}
        <div className="bg-cream-50 p-5 sm:p-6 rounded-xl border border-sand-300 shadow-sm relative overflow-hidden group hover:border-sand-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif uppercase tracking-wider text-slate font-bold">
              30-Day Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-success/15 text-success-text flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-sans text-navy-800">
              ₹{(stats?.revenue.last30Days || 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate font-sans">
              <span className="text-success-text font-bold">
                {stats?.ordersCount.last30Days || 0} orders
              </span>{' '}
              in last 30 days
            </div>
          </div>
        </div>

        {/* Needs Action */}
        <div className="bg-cream-50 p-5 sm:p-6 rounded-xl border border-sand-300 shadow-sm relative overflow-hidden group hover:border-sand-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif uppercase tracking-wider text-slate font-bold">
              Pending Orders
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-sans text-navy-800">
              {pendingAttentionCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate font-sans">
              <Link
                to="/admin/orders?status=pending"
                className="text-amber-800 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Process fulfillment</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-cream-50 p-5 sm:p-6 rounded-xl border border-sand-300 shadow-sm relative overflow-hidden group hover:border-sand-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif uppercase tracking-wider text-slate font-bold">
              Low Stock Warnings
            </span>
            <div className="w-9 h-9 rounded-lg bg-crimson-100 text-crimson-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold font-sans text-navy-800">
              {stats?.lowStockProducts.length || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate font-sans">
              <span className="text-crimson-600 font-bold">≤ 10 units</span> remaining in inventory
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Revenue & Orders Trend Chart */}
      <div className="bg-cream-50 p-6 sm:p-7 rounded-xl border border-sand-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-navy-800">Revenue & Order Trend</h2>
            <p className="text-xs text-slate">Daily sales performance over the past 30 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-slate">Daily Revenue (₹)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1860A8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1860A8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE3D2" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => val.slice(5)}
                tick={{ fontSize: 11, fill: '#8C7B63' }}
                stroke="#DCCDB4"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8C7B63' }}
                stroke="#DCCDB4"
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E2747',
                  borderRadius: '8px',
                  border: '1px solid #DCCDB4',
                  color: '#FBF8F2',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(10, 31, 58, 0.15)',
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1860A8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-cream-50 rounded-xl border border-sand-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-bold text-navy-800">Recent Customer Orders</h2>
              <p className="text-xs text-slate">Live order stream and fulfillment status</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:text-navy-800 flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-slate text-xs">
              No orders placed yet. Seed or test placing an order.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sand-300 text-slate font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-sand-200/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-navy-800 font-mono">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-navy-800">{order.customer.name}</div>
                        <div className="text-[11px] text-slate font-mono">{order.customer.phone}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-navy-800 font-sans">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'success'
                              : order.status === 'cancelled'
                              ? 'danger'
                              : order.status === 'pending'
                              ? 'warning'
                              : 'brand'
                          }
                        >
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-sand-200 hover:bg-navy-800 hover:text-cream-50 font-bold text-[11px] transition-colors"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist & Best Sellers (1 Col) */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="bg-cream-50 rounded-xl border border-sand-300 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-crimson-600" />
                <h3 className="text-sm font-serif font-bold text-navy-800">Low Stock Alert</h3>
              </div>
              <Link
                to="/admin/products"
                className="text-[11px] font-bold text-slate hover:text-navy-800"
              >
                Inventory
              </Link>
            </div>

            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-2.5">
                {stats.lowStockProducts.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-crimson-100/50 border border-crimson-200 text-xs"
                  >
                    <div className="truncate max-w-[170px]">
                      <p className="font-bold text-navy-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate font-mono">Size: {item.size}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-crimson-600 text-white shrink-0">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-success-text bg-success/15 p-3 rounded-lg border border-success/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>All product sizes healthy above 10 units</span>
              </div>
            )}
          </div>

          {/* Top Selling Uniforms */}
          <div className="bg-cream-50 rounded-xl border border-sand-300 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold text-navy-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Top Uniforms Sold</span>
            </h3>

            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 truncate max-w-[170px]">
                      {prod.image && (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-8 h-8 rounded-md object-cover bg-sand-200 border border-sand-300 shrink-0"
                        />
                      )}
                      <span className="font-serif font-bold text-navy-800 truncate">{prod.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-navy-800 font-sans">{prod.totalQty} sold</div>
                      <div className="text-[10px] text-slate font-sans">
                        ₹{prod.totalRevenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate text-center py-4">No sales recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
