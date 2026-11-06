import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { usePublicSettings } from '../../api';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQty,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  const subtotal = getSubtotal();
  const totalCount = getTotalItems();
  const freeThreshold = settings?.freeDeliveryAbove || 1500;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const diff = freeThreshold - subtotal;

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-100 shadow-drawer border-l border-sand-300 flex flex-col z-10 animate-in slide-in-from-right duration-300 text-ink">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-sand-300 bg-cream-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-navy-800 flex items-center justify-center text-cream-50">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-navy-800">
                  Your Uniform Bag
                </h2>
                <span className="text-[11px] font-mono text-blue-600 font-semibold block">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-[8px] text-slate hover:text-navy-800 hover:bg-sand-200 transition-colors btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery meter */}
          <div className="bg-sand-200/50 px-5 py-3.5 border-b border-sand-300">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-navy-800 font-medium">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                {diff > 0 ? (
                  <span>
                    Add <strong className="text-navy-800 font-bold">₹{diff.toLocaleString('en-IN')}</strong> more for Free Delivery
                  </span>
                ) : (
                  <span className="text-emerald-800 font-serif italic font-bold">
                    🎉 Free Bhopal Local Delivery Unlocked!
                  </span>
                )}
              </span>
              <span className="text-slate font-mono text-[11px]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-sand-300 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  diff <= 0 ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-[10px] bg-cream-50 border border-sand-300 text-slate flex items-center justify-center mx-auto shadow-subtle">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-navy-800">Your bag is empty</h3>
                  <p className="text-xs text-slate mt-1 max-w-xs mx-auto leading-relaxed">
                    Select your child's school or browse winter blazers, skirts, and tailored shirts.
                  </p>
                </div>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-navy-800 hover:bg-navy-700 text-cream-50 text-xs font-semibold shadow-sm btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span>Explore School Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color || ''}`}
                  className="bg-cream-50 p-3.5 rounded-[10px] border border-sand-300 shadow-subtle flex gap-3.5 relative hover:border-blue-600 transition-colors"
                >
                  {/* Item Image */}
                  <div className="w-16 h-20 rounded-[8px] bg-cream-100 overflow-hidden shrink-0 border border-sand-300">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        {item.schoolCode && (
                          <span className="text-[10px] font-mono font-bold bg-blue-100 px-1.5 py-0.5 rounded text-navy-800 border border-blue-600/30">
                            {item.schoolCode}
                          </span>
                        )}
                        <span className="text-[11px] font-serif italic text-brass-text truncate">
                          {item.schoolName}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-navy-800 truncate mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate">
                        Size: <strong className="text-navy-800 font-mono">{item.size}</strong>
                        {item.color && (
                          <> • Colour: <strong className="text-navy-800 font-sans capitalize">{item.color}</strong></>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-sand-300">
                      {/* Qty controller */}
                      <div className="flex items-center border border-sand-300 rounded-[6px] bg-cream-100">
                        <button
                          onClick={() => updateQty(item.productId, item.size, item.qty - 1, item.color)}
                          className="p-1 hover:bg-cream-50 text-slate transition-colors btn-tactile"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-navy-800 min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.size, item.qty + 1, item.color)}
                          className="p-1 hover:bg-cream-50 text-slate transition-colors btn-tactile"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line price */}
                      <div className="text-right">
                        <span className="font-bold text-sm text-navy-800 font-serif">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="absolute top-2 right-2 text-slate hover:text-crimson-700 p-1 rounded transition-colors focus-visible:ring-1 focus-visible:ring-crimson-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Bar */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-cream-50 border-t border-sand-300 space-y-3.5">
              <div className="space-y-1.5 text-xs text-slate">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-mono font-semibold text-navy-800">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Local Bhopal Delivery</span>
                  <span className="font-mono font-semibold text-navy-800">
                    {diff <= 0 ? (
                      <span className="text-emerald-800 font-serif italic font-bold">FREE</span>
                    ) : (
                      `₹${settings?.deliveryFee || 60}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-navy-800 pt-2 border-t border-sand-300">
                  <span>Estimated Total</span>
                  <span className="font-serif font-bold text-lg text-navy-800">
                    ₹{(subtotal + (diff <= 0 ? 0 : settings?.deliveryFee || 60)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/cart');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-[8px] border border-navy-800 bg-cream-50 hover:bg-sand-200 text-navy-800 text-xs font-semibold transition-colors btn-tactile text-center focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  View Full Bag
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-[8px] bg-crimson-600 hover:bg-crimson-700 active:bg-crimson-800 text-white text-xs font-semibold shadow-md shadow-crimson-600/20 transition-all btn-tactile flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-crimson-600"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-center text-slate font-serif italic">
                Store trial & pickup available at all 4 Bhopal branches
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
