import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Download,
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Filter,
  Truck,
  Store,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAdminOrders } from '../../api';
import { api } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const Orders: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fulfilmentFilter, setFulfilmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useAdminOrders({
    q: search,
    status: statusFilter,
    fulfilment: fulfilmentFilter,
    page,
    limit: 15,
  });

  const orders = ordersData?.items || [];
  const totalPages = ordersData?.totalPages || 1;

  // Handle Export CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/admin/orders/export.csv', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `indraprasth_orders_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Orders exported successfully');
    } catch (err) {
      toast.error('Failed to export orders CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'packed':
        return <Badge variant="info">Packed</Badge>;
      case 'out_for_delivery':
        return <Badge variant="info">Out for Delivery</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="warning">Ready for Pickup</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Customer Orders | Admin - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate mt-1 font-sans">
            Track and fulfill home deliveries, store pickups, COD collections and invoices.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-sand-300 hover:bg-sand-200/50 text-slate font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate" />
          <span>{isExporting ? 'Generating CSV...' : 'Export Orders CSV'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-cream-50 p-4 rounded-xl border border-sand-300 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order # or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
            >
              <option value="">All Fulfillment Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Fulfilment Method */}
          <div>
            <select
              value={fulfilmentFilter}
              onChange={(e) => {
                setFulfilmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
            >
              <option value="">All Fulfillment Types</option>
              <option value="home_delivery">Home Delivery</option>
              <option value="store_pickup">Store Pickup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-cream-50 rounded-xl border border-sand-300 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShoppingBag className="w-12 h-12 text-sand-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-navy-800">No orders found</h3>
            <p className="text-xs text-slate mt-1 font-sans">
              {search || statusFilter || fulfilmentFilter
                ? 'Try broadening your search query or filters.'
                : 'Customer orders placed on the storefront will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/70 text-navy-800 font-serif font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Fulfillment / Branch</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {orders.map((order) => {
                  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order._id} className="hover:bg-sand-200/40 transition-colors">
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="font-bold text-navy-800 hover:text-blue-600 block text-xs font-mono"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-[10px] text-slate flex items-center gap-1 mt-0.5 font-sans">
                          <Calendar className="w-3 h-3 text-slate/70" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-800">{order.customer.name}</div>
                        <div className="text-[11px] text-slate font-mono">
                          {order.customer.phone}
                        </div>
                      </td>

                      {/* Fulfilment */}
                      <td className="py-3.5 px-4">
                        {order.fulfilment === 'home_delivery' ? (
                          <div className="flex items-center gap-1.5 text-navy-800">
                            <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold">Bhopal Home Delivery</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-navy-800">
                            <Store className="w-3.5 h-3.5 text-brass-text shrink-0" />
                            <span className="font-semibold">
                              Pickup: {order.pickupBranch || 'Jawahar Chowk (HQ)'}
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] uppercase font-bold text-slate block mt-0.5">
                          Payment: {order.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-navy-800">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </div>
                        <div className="text-[10px] text-slate line-clamp-1 max-w-xs mt-0.5">
                          {order.items
                            .map((i) => `${i.nameSnapshot} (${i.size}) x${i.qty}`)
                            .join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-800 font-sans">
                          ₹{order.total.toLocaleString('en-IN')}
                        </div>
                        {order.deliveryFee > 0 && (
                          <span className="text-[10px] text-slate block">
                            incl. ₹{order.deliveryFee} shipping
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand-200 hover:bg-navy-800 hover:text-cream-50 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-sand-300 flex items-center justify-between text-xs font-sans">
            <span className="text-slate">
              Page <span className="font-bold text-navy-800">{page}</span> of{' '}
              <span className="font-bold text-navy-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-sand-300 disabled:opacity-40 hover:bg-sand-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-sand-300 disabled:opacity-40 hover:bg-sand-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
