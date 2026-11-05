import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, MessageCircle, ArrowRight, Package, Home } from 'lucide-react';
import { usePublicSettings } from '../../api';

export const OrderSuccess: React.FC = () => {
  const { orderNumber: paramNum } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const order = location.state?.order;
  const searchParams = new URLSearchParams(location.search);
  const orderNumber = paramNum || order?.orderNumber || searchParams.get('orderNumber') || '';
  const customerPhone = order?.customer?.phone || searchParams.get('phone') || '';
  const { data: settings } = usePublicSettings();

  const handleWhatsAppShare = () => {
    const text = `Hi, I just placed an order with Indraprasth Uniforms!\n\nOrder Number: ${orderNumber}\nAmount: ₹${order?.total || ''}\nTrack it at: ${window.location.origin}/track-order?orderNumber=${orderNumber}${customerPhone ? `&phone=${customerPhone}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <Helmet>
        <title>Order Placed Successfully | Indraprasth Uniforms Bhopal</title>
      </Helmet>

      {/* Success Badge */}
      <div className="w-20 h-20 bg-success/15 text-success-text border border-success/30 rounded-full flex items-center justify-center mx-auto shadow-sm animate-in zoom-in">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block">
          Order Authorized & Logged
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-navy-800 tracking-tight">
          Thank you for choosing Indraprasth.
        </h1>
        <p className="text-sm text-slate max-w-md mx-auto font-sans leading-relaxed">
          We have received your uniform order and our central Bhopal tailoring & dispatch unit has initiated preparation.
        </p>
      </div>

      {/* Order Number Box */}
      <div className="p-6 bg-cream-50 rounded-lg border border-sand-300 shadow-sm text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sand-300 gap-2">
          <div>
            <span className="text-xs font-serif uppercase tracking-wider text-slate block">
              Official Order Number
            </span>
            <span className="text-xl sm:text-2xl font-bold text-navy-800 font-mono">
              {orderNumber}
            </span>
          </div>

          <Link
            to={`/track-order?orderNumber=${orderNumber}${customerPhone ? `&phone=${customerPhone}` : ''}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800 bg-sand-200 border border-sand-300 hover:bg-sand-300 px-3.5 py-2 rounded-lg transition-colors btn-tactile shadow-sm"
          >
            <Package className="w-4 h-4 text-blue-600" />
            <span>Track Live Status</span>
          </Link>
        </div>

        {order && (
          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <span className="text-slate font-serif italic">Customer:</span>
              <p className="font-bold text-navy-800 mt-0.5">{order.customer?.name}</p>
              <p className="text-slate font-mono">{order.customer?.phone}</p>
            </div>
            <div>
              <span className="text-slate font-serif italic">Order Total:</span>
              <p className="font-bold text-navy-800 mt-0.5 text-sm font-sans">₹{order.total?.toLocaleString('en-IN')}</p>
              <p className="text-slate capitalize">Payment: {order.paymentMethod?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition-colors btn-tactile"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Share Order Details on WhatsApp</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-cream-50 hover:bg-sand-200 text-navy-800 border border-sand-300 font-medium text-sm transition-colors btn-tactile shadow-sm"
        >
          <Home className="w-4 h-4 text-slate" />
          <span>Return to Homepage</span>
        </Link>
      </div>

      {/* Bhopal branches note */}
      <div className="pt-4 text-xs text-slate font-serif italic">
        Need assistance? Visit any of our 4 Bhopal branches or call +91 98260 25211
      </div>
    </div>
  );
};
