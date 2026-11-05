import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  MessageCircle,
  Ruler,
  Truck,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Scissors,
} from 'lucide-react';
import { useProduct, usePublicSettings } from '../../api';
import { useCartStore } from '../../store/cart';
import { ISchool, ICategory } from '@indraprasth/shared';
import { ProductCard } from '../../components/product/ProductCard';
import { SizeGuideModal } from '../../components/product/SizeGuideModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import toast from 'react-hot-toast';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { data: settings } = usePublicSettings();
  const { addItem } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Set default size once product is loaded
  React.useEffect(() => {
    if (product && product.sizes?.length > 0 && !selectedSize) {
      const firstInStock = product.sizes.find((s) => s.stock > 0);
      setSelectedSize(firstInStock ? firstInStock.label : product.sizes[0].label);
    }
  }, [product, selectedSize]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-[480px] rounded-[10px]" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-navy-800">Uniform not found</h2>
        <p className="text-slate font-sans">The item you are looking for may have moved or been updated in our catalog.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-navy-800 text-cream-50 font-medium btn-tactile shadow-sm min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const school = product.school as ISchool;
  const category = product.category as ICategory;
  const activeImage = product.images[selectedImageIndex]?.url || product.images[0]?.url;

  const currentSizeObj = product.sizes.find((s) => s.label === selectedSize);
  const currentStock = currentSizeObj ? currentSizeObj.stock : 0;
  const isOutOfStock = currentStock <= 0;

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: (product._id || product.id) as string,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      size: selectedSize,
      qty: quantity,
      image: product.images[0]?.url || '',
      schoolCode: school?.code,
      schoolName: school?.name,
      category: category?.name,
    });

    toast.success(`Added ${quantity}x ${product.name} (${selectedSize}) to bag!`, {
      icon: '🛍️',
      style: {
        background: '#0E2747',
        color: '#FBF8F2',
        border: '1px solid #14407A',
        fontFamily: 'Inter',
      },
    });
  };

  const handleBuyOnWhatsApp = () => {
    const phone = settings?.whatsappNumber || '919826025211';
    const msg = `Hello Indraprasth Uniforms, I want to reserve / order:\n\n*Product:* ${product.name}\n*School:* ${school?.name || 'N/A'}\n*Size:* ${selectedSize}\n*Quantity:* ${quantity}\n*Price:* ₹${product.price}\n*Link:* ${window.location.href}\n\nPlease let me know store availability and trial options.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <Helmet>
        <title>{`${product.name} | Indraprasth Uniforms Bhopal`}</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate font-serif italic">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-blue-600 transition-colors">
          Catalog
        </Link>
        {school?.name && (
          <>
            <span>/</span>
            <Link to={`/school/${school.slug}`} className="hover:text-blue-600 transition-colors">
              {school.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-navy-800 truncate max-w-xs font-sans not-italic font-medium">{product.name}</span>
      </nav>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="relative aspect-[4/5] sm:aspect-square rounded-[10px] bg-cream-100 overflow-hidden border border-sand-300 shadow-plinth cursor-zoom-in group"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={getOptimizedImageUrl(activeImage, { width: 900 })}
              alt={product.name}
              style={
                isZoomed
                  ? {
                      transform: 'scale(2.2)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : { transform: 'scale(1)' }
              }
              className="w-full h-full object-cover object-center transition-transform duration-150 ease-out select-none pointer-events-none"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-crimson-600 text-white text-xs font-bold uppercase px-2.5 py-1 rounded shadow-md z-10">
                {discountPercent}% Concession
              </span>
            )}
            <div className="absolute bottom-3 right-3 bg-navy-900/70 backdrop-blur-sm text-cream-50 text-[10px] font-serif italic px-3 py-1 rounded-full pointer-events-none transition-opacity duration-200">
              {isZoomed ? 'Inspecting weave density' : 'Hover to inspect uniform tailoring & fabric'}
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-[8px] overflow-hidden border-2 transition-all shrink-0 btn-tactile ${
                    selectedImageIndex === idx
                      ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                      : 'border-sand-300 opacity-70 hover:opacity-100 bg-cream-50'
                  }`}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <img
                    src={getOptimizedImageUrl(img.url, { width: 160 })}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {school?.code && (
                <span className="bg-blue-100 text-navy-800 text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded border border-blue-600/30">
                  {school.code}
                </span>
              )}
              <span className="text-xs font-serif uppercase tracking-wider text-slate bg-sand-200 px-2 py-0.5 rounded border border-sand-300">
                {category?.name || 'Regulation Uniform'}
              </span>
              {product.sku && (
                <span className="text-[11px] text-slate font-mono ml-auto">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight leading-tight">
              {product.name}
            </h1>

            {school?.name && (
              <p className="text-sm text-slate font-serif italic">
                Official uniform requirement for <span className="text-navy-800 font-bold not-italic">{school.name}</span>
              </p>
            )}
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-[10px] bg-cream-50 border border-sand-300 shadow-plinth flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-base text-taupe-500 line-through font-sans">
                MRP ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs text-slate ml-auto font-serif italic">Inclusive of all taxes</span>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold">
                Select Tailored Size:
              </label>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-semibold flex items-center gap-1 transition-colors focus-visible:ring-1 focus-visible:ring-blue-600"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide & Chart</span>
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={s.stock <= 0}
                  onClick={() => setSelectedSize(s.label)}
                  className={`py-2.5 px-3 rounded-[8px] text-xs sm:text-sm font-mono border transition-all flex flex-col items-center justify-center btn-tactile min-h-[44px] ${
                    selectedSize === s.label
                      ? 'border-navy-800 bg-navy-800 text-cream-50 font-bold shadow-xs'
                      : s.stock <= 0
                      ? 'border-sand-300 bg-sand-200 text-slate/40 cursor-not-allowed line-through'
                      : 'border-sand-300 bg-cream-50 text-navy-800 hover:border-blue-600 hover:bg-cream-100'
                  }`}
                >
                  <span className="font-bold">{s.label}</span>
                  <span className="text-[10px] font-sans font-normal text-slate mt-0.5">
                    {s.stock > 0 ? (s.stock <= 5 ? `Low (${s.stock})` : 'In stock') : 'Sold out'}
                  </span>
                </button>
              ))}
            </div>

            {/* Current Stock status message */}
            <div className="text-xs flex items-center gap-1.5 pt-1">
              {isOutOfStock ? (
                <span className="text-crimson-700 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-crimson-600" /> Selected size currently out of stock. Contact our Bhopal branch for trial reservation.
                </span>
              ) : currentStock <= 5 ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  ⚡ Limited availability: Only {currentStock} items left in size {selectedSize}.
                </span>
              ) : (
                <span className="text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready for fulfillment & store trial across Bhopal branches.
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold block">
              Quantity:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-sand-300 rounded-[8px] bg-cream-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-[6px] hover:bg-sand-200 flex items-center justify-center font-bold text-navy-800 btn-tactile"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-mono font-bold text-navy-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock || 10, quantity + 1))}
                  className="w-8 h-8 rounded-[6px] hover:bg-sand-200 flex items-center justify-center font-bold text-navy-800 btn-tactile"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate font-sans">
                Subtotal: <strong className="text-navy-800 font-sans">₹{(product.price * quantity).toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 px-6 rounded-[8px] font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all btn-tactile min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isOutOfStock
                  ? 'bg-sand-200 text-slate/50 cursor-not-allowed shadow-none border border-sand-300'
                  : 'bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-cream-50 border border-navy-700'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-cream-50" />
              <span>{isOutOfStock ? 'Temporarily Sold Out' : 'Add to Shopping Bag'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyOnWhatsApp}
              className="w-full py-3.5 px-6 rounded-[8px] font-medium text-sm sm:text-base border border-emerald-600/40 bg-cream-50 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center gap-2 transition-colors btn-tactile shadow-subtle min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>Reserve on WhatsApp Concierge</span>
            </button>
          </div>

          {/* Assurance bullets */}
          <div className="p-4 rounded-[10px] border border-sand-300 bg-cream-50 space-y-2 text-xs text-ink shadow-subtle">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free Bhopal delivery on orders above ₹1,500</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Guaranteed school compliance & certified dye lots</span>
            </div>
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-brass shrink-0" />
              <span>Free alteration service at all 4 Bhopal branches</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-sand-300 space-y-2">
            <h3 className="font-serif font-bold text-sm text-navy-800">Tailoring & Weave Specifications</h3>
            <p className="text-xs sm:text-sm text-slate leading-relaxed whitespace-pre-line font-sans">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products from Same School */}
      {product.related && product.related.length > 0 && (
        <section className="pt-12 border-t border-sand-300 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block mb-1">
                Uniform Ensemble
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800">
                Coordinated Uniforms for {school?.name || 'this School'}
              </h2>
            </div>
            {school?.slug && (
              <Link
                to={`/school/${school.slug}`}
                className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-bold"
              >
                View full uniform kit →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.related.map((rel) => (
              <ProductCard key={rel._id || rel.slug} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
};
