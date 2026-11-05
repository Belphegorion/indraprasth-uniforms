import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { usePublicSettings } from '../../api';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const { items, removeItem, updateQty, getSubtotal, getTotalItems } = useCartStore();

  const subtotal = getSubtotal();
  const totalCount = getTotalItems();
  const freeThreshold = settings?.freeDeliveryAbove || 1500;
  const deliveryFee = subtotal >= freeThreshold ? 0 : settings?.deliveryFee || 60;
  const grandTotal = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 text-ink">
        <Helmet>
          <title>Your Bag is Empty | Indraprasth Uniforms Bhopal</title>
        </Helmet>
        <div className="w-20 h-20 rounded-[10px] bg-cream-50 border border-sand-300 text-blue-600 flex items-center justify-center mx-auto shadow-subtle">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-navy-800">Your Shopping Bag is Empty</h1>
          <p className="text-sm text-slate max-w-sm mx-auto font-sans">
            Explore our regulation school uniform catalog for blazers, shirts, sweaters, and accessories.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[8px] bg-navy-800 hover:bg-navy-700 text-cream-50 font-medium text-sm shadow-sm btn-tactile min-h-[44px]"
        >
          <span>Explore School Catalog</span>
          <ArrowRight className="w-4 h-4 text-cream-50" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-ink">
      <Helmet>
        <title>{`Shopping Bag (${totalCount}) | Indraprasth Uniforms Bhopal`}</title>
      </Helmet>

      <div className="border-b border-sand-300 pb-4">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block mb-1">
          Review Your Selected Uniforms
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800">
          Shopping Bag ({totalCount} {totalCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free delivery prompt */}
          <div className="p-4 bg-sand-200/50 rounded-[10px] border border-sand-300 flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs sm:text-sm text-ink font-sans">
              {subtotal >= freeThreshold ? (
                <span className="font-serif italic font-bold text-emerald-800">
                  🎉 Congratulations! Your order qualifies for FREE delivery across Bhopal.
                </span>
              ) : (
                <span>
                  Add items worth <strong className="text-navy-800 font-bold">₹{(freeThreshold - subtotal).toLocaleString('en-IN')}</strong>{' '}
                  more to get <strong>FREE delivery</strong> across Bhopal!
                </span>
              )}
            </div>
          </div>

          <div className="bg-cream-50 rounded-[10px] border border-sand-300 divide-y divide-sand-300 overflow-hidden shadow-plinth">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-sand-200/30 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-[8px] bg-cream-100 border border-sand-300 shrink-0"
                  />
                  <div>
                    {item.schoolCode && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navy-800 bg-blue-100 px-2 py-0.5 rounded-[4px] border border-blue-600/30">
                        {item.schoolCode}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-serif font-bold text-navy-800 mt-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate mt-0.5">
                      Tailored Size: <strong className="text-navy-800 font-mono font-semibold">{item.size}</strong>
                    </p>
                    <span className="text-xs font-serif font-bold text-navy-800 block mt-1">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-sand-300">
                  {/* Quantity control */}
                  <div className="flex items-center border border-sand-300 rounded-[6px] bg-cream-100">
                    <button
                      onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                      className="p-1.5 hover:bg-cream-50 text-slate transition-colors btn-tactile"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-navy-800 min-w-[24px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                      className="p-1.5 hover:bg-cream-50 text-slate transition-colors btn-tactile"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total */}
                  <span className="font-bold font-serif text-base text-navy-800 min-w-[80px] text-right">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-slate hover:text-crimson-700 p-1.5 rounded transition-colors focus-visible:ring-1 focus-visible:ring-crimson-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-bold"
            >
              ← Continue browsing catalog
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-cream-50 rounded-[10px] border border-sand-300 p-6 shadow-plinth space-y-4">
            <h2 className="font-serif font-bold text-lg text-navy-800 pb-3 border-b border-sand-300">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-slate font-sans">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-navy-800">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Local Bhopal Delivery</span>
                <span className="font-mono font-semibold text-navy-800">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-800 font-serif italic font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-sand-300 font-serif font-bold text-base text-navy-800">
                <span>Grand Total</span>
                <span className="text-xl font-bold font-serif text-navy-800">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate font-serif italic text-right">
                Inclusive of GST and certified packaging
              </p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-[8px] bg-crimson-600 hover:bg-crimson-700 active:bg-crimson-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-crimson-600/20 btn-tactile min-h-[48px] focus-visible:ring-2 focus-visible:ring-crimson-600"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <div className="pt-2 text-[11px] text-slate space-y-1 font-serif italic text-center">
              <p>✓ Cash on Delivery & Store Trial available</p>
              <p>✓ Free alteration service across 4 Bhopal branches</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
