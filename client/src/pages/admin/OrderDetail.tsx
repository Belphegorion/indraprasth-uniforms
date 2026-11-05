import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Printer,
  Phone,
  MessageSquare,
  Truck,
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useAdminOrder, useUpdateOrderStatus, useAdminSettings } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id || '');
  const { data: settings } = useAdminSettings();
  const updateStatusMutation = useUpdateOrderStatus();

  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-sand-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-cream-50 rounded-3xl border border-sand-300 shadow-sm">
        <h2 className="text-lg font-bold text-navy-800 font-serif">Order Not Found</h2>
        <p className="text-xs text-taupe-500 mt-1">This order record could not be loaded.</p>
        <Link
          to="/admin/orders"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || newStatus === order.status) {
      toast.error('Please choose a different status');
      return;
    }

    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: (order._id || order.id || id) as string,
        status: newStatus,
        note: statusNote || undefined,
      });
      toast.success(`Order status updated to ${newStatus}`);
      setStatusNote('');
      setNewStatus('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Order ${order.orderNumber} | Admin - Indraprasth Uniforms`}</title>
      </Helmet>

      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-cream-50 border border-sand-300 text-slate hover:text-navy-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-navy-800 font-serif">
                {order.orderNumber}
              </h1>
              <Badge
                variant={
                  order.status === 'completed'
                    ? 'success'
                    : order.status === 'cancelled'
                    ? 'danger'
                    : order.status === 'pending'
                    ? 'warning'
                    : 'info'
                }
              >
                {order.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-xs text-taupe-500 mt-0.5">
              Placed on {dateFormatted} via {order.paymentMethod.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-50 border border-sand-300 hover:bg-sand-200/60 text-navy-800 font-bold text-xs shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <a
            href={`https://wa.me/91${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hello ${order.customer.name}, regarding your Indraprasth Uniforms order ${order.orderNumber}:`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>

      {/* Main Order View + Printable Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
        {/* Left Column: Items & Invoice Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 print:w-full">
          {/* Printable Invoice Header (Visible on screen and on print) */}
          <div className="bg-cream-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-6 print:border-none print:p-0 print:shadow-none print:w-full printable-invoice">
            {/* Invoice Meta */}
            <div className="border-b border-sand-200 pb-6 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <img
                  src="/logo.png"
                  alt="Indraprasth Uniforms"
                  className="h-10 w-auto object-contain mb-2"
                  width="140"
                  height="70"
                />
                <span className="font-black text-xl text-navy-800 font-serif tracking-tight block">
                  {settings?.businessName || 'Indraprasth Uniforms'}
                </span>
                <span className="text-xs text-taupe-500 italic block">
                  {settings?.tagline || 'The Uniform Icons since 1975'}
                </span>
                <span className="text-xs text-taupe-500 font-mono block mt-1">
                  GSTIN: {settings?.gstin || '23AAAAA0000A1Z5'}
                </span>
                <span className="text-xs text-slate block max-w-sm mt-1">
                  {settings?.address || 'Plot 23, New MLA Colony, Jawahar Chowk, Bhopal 462003'}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-taupe-500 block tracking-wider">
                  Tax Invoice / Receipt
                </span>
                <span className="text-lg font-black text-navy-800 block font-mono">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-taupe-500 block mt-1">
                  Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}
                </span>
                <span className="text-xs text-slate block">
                  Status: <strong className="uppercase text-navy-800">{order.status}</strong>
                </span>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-sand-100/60 border border-sand-200">
                <span className="font-bold text-taupe-500 uppercase tracking-wider text-[10px] block mb-1">
                  Customer Billing & Contact
                </span>
                <p className="font-extrabold text-navy-800 text-sm">{order.customer.name}</p>
                <p className="text-slate mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-taupe-500" />
                  <a href={`tel:${order.customer.phone}`} className="hover:underline font-mono text-blue-600">
                    {order.customer.phone}
                  </a>
                </p>
                {order.customer.email && (
                  <p className="text-slate mt-0.5">{order.customer.email}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-sand-100/60 border border-sand-200">
                <span className="font-bold text-taupe-500 uppercase tracking-wider text-[10px] block mb-1">
                  Fulfillment Destination
                </span>
                {order.fulfilment === 'home_delivery' ? (
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-navy-800">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Home Delivery</span>
                    </div>
                    {order.customer.address ? (
                      <p className="text-slate mt-1 leading-relaxed">
                        {order.customer.address.line1}, {order.customer.address.city} -{' '}
                        {order.customer.address.pincode}
                      </p>
                    ) : (
                      <p className="text-taupe-500 italic">No delivery address provided</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-navy-800">
                      <Store className="w-4 h-4 text-brass" />
                      <span>In-Store Pickup</span>
                    </div>
                    <p className="text-slate mt-1 font-semibold">
                      Branch: {order.pickupBranch || 'Jawahar Chowk (HQ)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-taupe-500 mb-3">
                Ordered Items
              </h3>
              <div className="border border-sand-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-sand-200/70 text-navy-800 font-semibold uppercase text-[10px] tracking-wider border-b border-sand-200">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Size</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.nameSnapshot}
                                className="w-8 h-8 rounded-lg object-cover bg-sand-100 border border-sand-200 shrink-0 print:hidden"
                              />
                            )}
                            <span className="font-bold text-navy-800">
                              {item.nameSnapshot}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold font-mono text-slate">
                          {item.size}
                        </td>
                        <td className="py-3 px-3 text-right text-slate font-mono">
                          ₹{item.priceSnapshot.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-navy-800">
                          {item.qty}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-navy-800 font-mono">
                          ₹{(item.priceSnapshot * item.qty).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="border-t border-sand-200 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-taupe-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-navy-800 font-mono">
                    ₹{order.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-taupe-500">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-navy-800 font-mono">
                    {order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'FREE'}
                  </span>
                </div>
                <div className="border-t border-sand-200 pt-2 flex justify-between text-sm font-black text-navy-800">
                  <span>Grand Total</span>
                  <span className="text-crimson-600 font-mono">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Customer Notes:</strong> {order.notes}
              </div>
            )}

            {/* Print Only Footer / Signatory */}
            <div className="hidden print:flex justify-between items-end pt-12 text-[11px] text-taupe-500">
              <div>
                <p className="font-bold text-navy-800">Terms & Conditions:</p>
                <p>1. Size exchange allowed within 7 days with invoice & tags intact.</p>
                <p>2. Official fabric and dye compliance certified.</p>
              </div>
              <div className="text-right">
                <div className="border-t border-sand-400 w-44 pt-1 font-bold text-navy-800">
                  Authorized Signatory
                </div>
                <p className="text-[10px] text-taupe-500">For Indraprasth Uniforms Bhopal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment Status Controller & Status Timeline */}
        <div className="space-y-6 print:hidden">
          {/* Change Status Card */}
          <div className="bg-cream-50 p-6 rounded-3xl border border-sand-300 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-800 font-serif flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Update Fulfillment Status</span>
            </h3>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-800">New Status</label>
                <select
                  value={newStatus || order.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="ready_for_pickup">Ready for Store Pickup</option>
                  <option value="completed">Completed / Delivered</option>
                  <option value="cancelled">Cancelled (Restore Stock)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-800">Status Change Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched with Bhopal courier / Ready in Kolar branch"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
                />
              </div>

              {newStatus === 'cancelled' && (
                <div className="p-2.5 rounded-xl bg-crimson-100 border border-crimson-600/30 text-crimson-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-crimson-600" />
                  <span>Cancelling will automatically restore product inventory stock!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all"
              >
                {isUpdating ? 'Updating...' : 'Save Status Update'}
              </button>
            </form>
          </div>

          {/* Timeline History */}
          <div className="bg-cream-50 p-6 rounded-3xl border border-sand-300 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-800 font-serif flex items-center gap-2">
              <Calendar className="w-4 h-4 text-taupe-500" />
              <span>Status Audit Log</span>
            </h3>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand-300">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((h, i) => (
                  <div key={i} className="relative text-xs">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                    <div className="font-bold text-navy-800 uppercase tracking-tight">
                      {h.status.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-taupe-500 mt-0.5">
                      {new Date(h.at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • By {h.by || 'System'}
                    </div>
                    {h.note && (
                      <p className="text-[11px] text-slate mt-1 bg-sand-100/70 p-2 rounded-lg border border-sand-200">
                        {h.note}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-taupe-500">Initial order placement recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
