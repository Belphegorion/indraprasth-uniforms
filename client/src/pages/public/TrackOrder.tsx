import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { IOrder, OrderStatus } from '@indraprasth/shared';

const STATUS_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'packed',
  'out_for_delivery',
  'completed',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Received',
  confirmed: 'Confirmed & Cut',
  packed: 'Quality Inspected & Packed',
  out_for_delivery: 'Out for Delivery / Ready',
  ready_for_pickup: 'Ready at Branch',
  completed: 'Delivered / Completed',
  cancelled: 'Cancelled',
};

export const TrackOrder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (num: string, ph: string) => {
    if (!num || !ph) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders/track', {
        params: { orderNumber: num.trim(), phone: ph.trim() },
      });
      if (res.data.success && res.data.data) {
        setOrder(res.data.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'No matching uniform order found for this number and phone combination.'
      );
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      fetchTracking(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) {
      setError('Please provide both Order Number and registered Mobile Number');
      return;
    }
    setSearchParams({ orderNumber: orderNumber.trim(), phone: phone.trim() });
    fetchTracking(orderNumber, phone);
  };

  // Determine current active step index
  const getCurrentStepIndex = (status: OrderStatus) => {
    if (status === 'ready_for_pickup') return 3;
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Helmet>
        <title>Track Your Order | Indraprasth Uniforms Bhopal</title>
        <meta
          name="description"
          content="Track live status and dispatch updates of your Bhopal school uniform order."
        />
      </Helmet>

      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block">
          Dispatch & Fulfillment Radar
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
          Track Your Uniform Order
        </h1>
        <p className="text-xs sm:text-sm text-slate font-sans">
          Enter your order number (e.g. IU-20261104-0001) and the 10-digit mobile number provided at checkout.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-cream-50 p-6 sm:p-8 rounded-lg border border-sand-300 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Order Number *</label>
            <input
              type="text"
              placeholder="e.g. IU-20261104-0001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Registered Mobile Phone *</label>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9826012345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[44px] py-3.5 px-6 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 font-serif font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all btn-tactile disabled:opacity-60"
        >
          {isLoading ? (
            <span>Querying central order ledger...</span>
          ) : (
            <>
              <Search className="w-4 h-4 text-cream-50" />
              <span>Track Uniform Status</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-crimson-100 border border-crimson-200 text-crimson-800 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-crimson-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="bg-cream-50 rounded-lg border border-sand-300 p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sand-300 gap-3">
            <div>
              <span className="text-xs font-serif uppercase tracking-wider text-slate block">
                Fulfillment Docket
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 font-mono">
                {order.orderNumber}
              </h2>
              <span className="text-xs text-slate font-sans">
                Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider ${
                  order.status === 'cancelled'
                    ? 'bg-crimson-100 text-crimson-800'
                    : order.status === 'completed'
                    ? 'bg-success/15 text-success-text'
                    : 'bg-blue-100 text-navy-800 border border-blue-600/30'
                }`}
              >
                {STATUS_LABELS[order.status] || order.status}
              </span>
              <p className="text-xs text-slate mt-1 capitalize font-serif italic">
                Fulfilment: {order.fulfilment.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Timeline Visual Steps (if not cancelled) */}
          {order.status !== 'cancelled' ? (
            <div className="py-4">
              <div className="relative">
                <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-sand-200">
                  <div
                    style={{
                      width: `${(getCurrentStepIndex(order.status) / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                  />
                </div>
                <div className="grid grid-cols-5 text-center text-xs">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = getCurrentStepIndex(order.status) >= idx;
                    return (
                      <div key={step} className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-[11px] ${
                            isDone ? 'bg-navy-800 text-cream-50' : 'bg-sand-200 text-slate'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`block text-[11px] ${
                            isDone ? 'text-navy-800 font-serif font-bold' : 'text-slate/70 font-sans'
                          }`}
                        >
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-crimson-100 border border-crimson-200 rounded-lg text-xs text-crimson-800 font-serif italic">
              This order has been cancelled. Any allocated inventory has been restored to store stocks.
            </div>
          )}

          {/* Status Timeline History */}
          <div className="border-t border-sand-300 pt-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-navy-800">Activity Ledger</h3>
            <div className="space-y-3">
              {order.statusHistory?.map((hist, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-serif font-bold text-navy-800 capitalize">
                      {STATUS_LABELS[hist.status] || hist.status}
                    </p>
                    <p className="text-slate font-mono text-[11px]">
                      {new Date(hist.at).toLocaleString('en-IN')} by {hist.by}
                    </p>
                    {hist.note && <p className="text-slate mt-0.5 font-serif italic">"{hist.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items In This Order */}
          <div className="border-t border-sand-300 pt-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-navy-800">Manifest Garments</h3>
            <div className="divide-y divide-sand-300">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-md bg-sand-200 border border-sand-300" />
                    <div>
                      <p className="font-serif font-bold text-navy-800">{item.nameSnapshot}</p>
                      <p className="text-slate font-mono text-[11px]">
                        Size: {item.size} • Qty: {item.qty}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-navy-800 font-sans">
                    ₹{(item.priceSnapshot * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-sand-300 flex justify-between text-base font-serif font-bold text-navy-800">
              <span>Total Settleable</span>
              <span className="text-xl font-bold font-sans text-navy-800">₹{order.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
