import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Truck,
  Store,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  MapPin,
  AlertCircle,
  Scissors,
} from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { usePublicSettings, useCreateOrder } from '../../api';
import { z } from 'zod';
import toast from 'react-hot-toast';

const clientCheckoutSchema = z.object({
  name: z.string().min(2, 'Full name is required (min 2 characters)'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number starting with 6-9'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  line1: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().max(500, 'Max 500 characters').optional(),
});

type CheckoutFormData = z.infer<typeof clientCheckoutSchema>;

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const { items, getSubtotal, clearCart } = useCartStore();
  const createOrderMutation = useCreateOrder();

  const [fulfilment, setFulfilment] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'pay_at_store' | 'online'>('cod');
  const [selectedBranch, setSelectedBranch] = useState<string>(
    settings?.branches?.[0]?.name || 'Jawahar Chowk (HQ)'
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const freeThreshold = settings?.freeDeliveryAbove || 1500;
  const deliveryFee =
    fulfilment === 'store_pickup'
      ? 0
      : subtotal >= freeThreshold
      ? 0
      : settings?.deliveryFee || 60;
  const grandTotal = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(clientCheckoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      line1: '',
      city: 'Bhopal',
      pincode: '462003',
      notes: '',
    },
  });

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-navy-800">Your bag is empty</h2>
        <p className="text-sm text-slate font-sans">Add uniforms to your bag before checking out.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 font-medium text-sm shadow-sm btn-tactile transition-colors"
        >
          Browse School Catalog
        </Link>
      </div>
    );
  }

  const onSubmit = async (formData: any) => {
    setServerError(null);

    const payload: any = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
      },
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        qty: i.qty,
      })),
      paymentMethod,
      fulfilment,
      notes: formData.notes || undefined,
    };

    if (fulfilment === 'home_delivery') {
      payload.customer.address = {
        line1: formData.line1,
        city: formData.city || 'Bhopal',
        pincode: formData.pincode,
      };
    } else {
      payload.pickupBranch = selectedBranch;
    }

    try {
      const response = await createOrderMutation.mutateAsync(payload);
      if (response.success && response.data) {
        clearCart();
        toast.success('Order placed successfully!', {
          icon: '🎉',
          style: {
            background: '#0E2747',
            color: '#FBF8F2',
            border: '1px solid #DCCDB4',
          },
        });
        navigate(`/order-success/${response.data.orderNumber}`, {
          state: { order: response.data },
        });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || 'Failed to place order. Please check item stock.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>Checkout | Indraprasth Uniforms Bhopal</title>
      </Helmet>

      <div className="border-b border-sand-300 pb-4">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block mb-1">
          Finalize Uniform Order
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
          Secure Guest Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate mt-1 font-sans">
          No password required. Instant placement with home delivery across Bhopal or branch trial pickup.
        </p>
      </div>

      {serverError && (
        <div className="p-4 bg-crimson-100 border border-crimson-200 text-crimson-800 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-crimson-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form: Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Info */}
            <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 space-y-4 shadow-sm">
              <h2 className="text-base font-serif font-bold text-navy-800 border-b border-sand-300 pb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-navy-800 text-cream-50 flex items-center justify-center text-xs font-mono font-bold">
                  1
                </span>
                <span>Parent / Student Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Full Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Full name is required' })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                  {errors.name && (
                    <p className="text-xs text-crimson-600 font-medium">{errors.name.message as string}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">
                    Mobile Phone (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit Indian phone number',
                      },
                    })}
                    placeholder="e.g. 9826012345"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                  {errors.phone && (
                    <p className="text-xs text-crimson-600 font-medium">{errors.phone.message as string}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">
                    Email Address (Optional for invoice)
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="e.g. rajesh@example.com"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* 2. Fulfilment Selection */}
            <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 space-y-4 shadow-sm">
              <h2 className="text-base font-serif font-bold text-navy-800 border-b border-sand-300 pb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-navy-800 text-cream-50 flex items-center justify-center text-xs font-mono font-bold">
                  2
                </span>
                <span>Fulfillment Mode</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFulfilment('home_delivery')}
                  className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all btn-tactile ${
                    fulfilment === 'home_delivery'
                      ? 'border-navy-800 bg-blue-100/60 ring-1 ring-blue-600 shadow-sm'
                      : 'border-sand-300 hover:border-sand-400 bg-cream-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-mono font-bold text-navy-800">
                      {subtotal >= freeThreshold ? 'FREE' : `+₹${settings?.deliveryFee || 60}`}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-navy-800">Bhopal Home Delivery</h3>
                    <p className="text-[11px] text-slate font-sans">Delivered to your residence</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfilment('store_pickup')}
                  className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all btn-tactile ${
                    fulfilment === 'store_pickup'
                      ? 'border-navy-800 bg-blue-100/60 ring-1 ring-blue-600 shadow-sm'
                      : 'border-sand-300 hover:border-sand-400 bg-cream-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-serif italic font-bold text-success-text">FREE</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-navy-800">Store Trial & Pickup</h3>
                    <p className="text-[11px] text-slate font-sans">Collect at 4 Bhopal retail shops</p>
                  </div>
                </button>
              </div>

              {/* Delivery Address Fields */}
              {fulfilment === 'home_delivery' ? (
                <div className="space-y-4 pt-3 border-t border-sand-300">
                  <div className="space-y-1">
                    <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Bhopal Street Address *</label>
                    <input
                      type="text"
                      {...register('line1', {
                        required:
                          fulfilment === 'home_delivery'
                            ? 'Delivery address is required'
                            : false,
                      })}
                      placeholder="House / Flat No., Colony, Street, Landmark"
                      className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                    />
                    {errors.line1 && (
                      <p className="text-xs text-crimson-600 font-medium">{errors.line1.message as string}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">City *</label>
                      <input
                        type="text"
                        {...register('city')}
                        readOnly
                        className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-sand-200/50 text-slate cursor-not-allowed font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">PIN Code *</label>
                      <input
                        type="text"
                        maxLength={6}
                        {...register('pincode', {
                          required: 'PIN code is required',
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Valid 6-digit PIN code required',
                          },
                        })}
                        placeholder="e.g. 462003"
                        className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                      />
                      {errors.pincode && (
                        <p className="text-xs text-crimson-600 font-medium">{errors.pincode.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Pickup Branch Selection */
                <div className="space-y-3 pt-3 border-t border-sand-300">
                  <label className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold block">
                    Select Pickup Branch:
                  </label>
                  <div className="space-y-2">
                    {settings?.branches?.map((b) => (
                      <label
                        key={b.name}
                        className={`p-3.5 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                          selectedBranch === b.name
                            ? 'border-navy-800 bg-blue-100/60 ring-1 ring-blue-600 shadow-sm'
                            : 'border-sand-300 hover:bg-cream-100/60 bg-cream-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="branch"
                          checked={selectedBranch === b.name}
                          onChange={() => setSelectedBranch(b.name)}
                          className="mt-1 text-blue-600 focus:ring-blue-600"
                        />
                        <div className="text-xs">
                          <p className="font-serif font-bold text-navy-800">{b.name}</p>
                          <p className="text-slate font-sans">{b.address}</p>
                          <p className="text-brass-text font-mono text-[11px] mt-0.5">{b.hours}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Method */}
            <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 space-y-4 shadow-sm">
              <h2 className="text-base font-serif font-bold text-navy-800 border-b border-sand-300 pb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-navy-800 text-cream-50 flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <span>Payment Settlement</span>
              </h2>

              <div className="space-y-3">
                <label
                  className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-navy-800 bg-blue-100/60 ring-1 ring-blue-600 shadow-sm'
                      : 'border-sand-300 hover:bg-cream-100/60 bg-cream-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-blue-600 focus:ring-blue-600"
                  />
                  <Banknote className="w-5 h-5 text-brass-text shrink-0" />
                  <div className="text-xs">
                    <p className="font-serif font-bold text-navy-800">Cash on Delivery (COD)</p>
                    <p className="text-slate font-sans">Pay via cash or UPI upon delivery at your doorstep</p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'pay_at_store'
                      ? 'border-navy-800 bg-blue-100/60 ring-1 ring-blue-600 shadow-sm'
                      : 'border-sand-300 hover:bg-cream-100/60 bg-cream-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'pay_at_store'}
                    onChange={() => setPaymentMethod('pay_at_store')}
                    className="text-blue-600 focus:ring-blue-600"
                  />
                  <Store className="w-5 h-5 text-brass-text shrink-0" />
                  <div className="text-xs">
                    <p className="font-serif font-bold text-navy-800">Pay at Store (After Fitting Trial)</p>
                    <p className="text-slate font-sans">Cash, UPI or card at our retail counter following alteration inspection</p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-navy-800 bg-blue-100/60 ring-1 ring-blue-600 shadow-sm'
                      : 'border-sand-300 hover:bg-cream-100/60 bg-cream-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="text-blue-600 focus:ring-blue-600"
                  />
                  <CreditCard className="w-5 h-5 text-brass-text shrink-0" />
                  <div className="text-xs">
                    <p className="font-serif font-bold text-navy-800">Online Payment Gateway (UPI, Cards, NetBanking)</p>
                    <p className="text-slate font-sans">Instant electronic order authorization via Razorpay</p>
                  </div>
                </label>
              </div>

              {/* Order Notes */}
              <div className="pt-2">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold block mb-1">
                  Child Name or Tailoring Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="e.g. Student Name: Aarav Patel (Class 5th B) / Deliver after 4 PM"
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 space-y-4 shadow-sm sticky top-24">
              <h2 className="text-base font-serif font-bold text-navy-800 border-b border-sand-300 pb-3">
                Order Manifest ({items.length} items)
              </h2>

              <div className="divide-y divide-sand-300 max-h-72 overflow-y-auto pr-1 space-y-2">
                {items.map((i) => (
                  <div key={`${i.productId}-${i.size}-${i.color || ''}`} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={i.image} alt="" className="w-10 h-12 object-cover rounded-md bg-sand-200 border border-sand-300" />
                      <div>
                        <p className="font-serif font-bold text-navy-800 line-clamp-1">{i.name}</p>
                        <p className="text-slate font-mono">
                          Size {i.size}{i.color ? ` • ${i.color}` : ''} × {i.qty}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold font-sans text-ink">₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-sand-300 pt-3 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-slate">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-semibold text-ink">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate">
                  <span>Fulfillment Choice</span>
                  <span className="font-medium text-navy-800 capitalize">
                    {fulfilment.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-slate">
                  <span>Delivery Charge</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-success-text font-serif italic font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-sand-300 pt-2 flex justify-between text-base font-serif font-bold text-navy-800">
                  <span>Grand Total</span>
                  <span className="text-2xl font-bold font-sans text-navy-800">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-lg bg-crimson-600 hover:bg-crimson-700 text-white font-serif font-bold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-all btn-tactile disabled:opacity-60"
              >
                {createOrderMutation.isPending ? (
                  <span>Reserving Stock & Placing Order...</span>
                ) : (
                  <>
                    <span>Confirm & Authorize Order</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate pt-2 font-serif italic">
                <ShieldCheck className="w-4 h-4 text-success-text" />
                <span>Zero Risk • Easy Size Exchange at 4 Bhopal Stores</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
