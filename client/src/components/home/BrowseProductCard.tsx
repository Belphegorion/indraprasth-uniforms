import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { IProduct, ISchool, ICategory } from '@indraprasth/shared';
import { useCartStore } from '../../store/cart';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import { getSchoolLogoUrl } from '../../utils/schoolLogos';
import toast from 'react-hot-toast';

interface BrowseProductCardProps {
  product: IProduct;
}

export const BrowseProductCard: React.FC<BrowseProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const [showSizePicker, setShowSizePicker] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const school = product.school as ISchool;
  const schoolLogo = getSchoolLogoUrl(school);
  const category = product.category as ICategory;
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const primaryImage =
    product.images[0]?.url ||
    product.variants?.[0]?.images?.[0]?.url ||
    'https://res.cloudinary.com/dvaynkflu/image/upload/v1791370845/indraprasth/products/ngfiqedvngrgzvuc12td.png';

  const totalStock = hasVariants
    ? product.variants!.reduce((acc, v) => acc + (v.sizes?.reduce((sAcc, s) => sAcc + (s.stock || 0), 0) || 0), 0)
    : (product.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) || 0);

  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= 5;

  const allPrices = hasVariants
    ? product.variants!.flatMap((v) => v.sizes?.map((s) => s.price).filter((p): p is number => typeof p === 'number' && p > 0) || [])
    : (product.sizes?.map((s) => s.price).filter((p): p is number => typeof p === 'number' && p > 0) || []);

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : product.price;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : product.price;
  const hasVariablePrice = minPrice !== maxPrice || hasVariants || (product.sizes && product.sizes.length > 1 && allPrices.length > 1);
  const displayPrice = minPrice || product.price;

  const discountPercent =
    product.mrp && product.mrp > displayPrice
      ? Math.round(((product.mrp - displayPrice) / product.mrp) * 100)
      : null;

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowSizePicker(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSizePicker(false);
    };

    if (showSizePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSizePicker]);

  const handleAddToCart = (sizeToAdd: string) => {
    if (isOutOfStock) return;

    const sizeObj = product.sizes.find((s) => s.label === sizeToAdd);
    const itemPrice = sizeObj?.price || displayPrice;

    addItem({
      productId: (product._id || product.id) as string,
      name: product.name,
      price: itemPrice,
      mrp: product.mrp,
      size: sizeToAdd,
      qty: 1,
      image: primaryImage,
      schoolCode: school?.code,
      schoolName: school?.name,
      category: category?.name,
    });

    toast.success(`Added ${product.name} (${sizeToAdd}) to bag`, {
      icon: '🛍️',
      position: 'bottom-right',
      style: {
        background: '#0E2747',
        color: '#FBF8F2',
        border: '1px solid #14407A',
        fontFamily: 'Inter',
      },
    });
    setShowSizePicker(false);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (hasVariants) {
      window.location.href = `/product/${product.slug}`;
      return;
    }

    if (product.sizes.length > 1) {
      setShowSizePicker((prev) => !prev);
    } else {
      handleAddToCart(product.sizes[0]?.label || 'Standard');
    }
  };

  return (
    <div className="group relative bg-cream-50 rounded-[10px] border border-sand-300 shadow-plinth hover:shadow-plinth-hover hover:border-brass transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/5] bg-cream-100 overflow-hidden border-b border-sand-300"
        tabIndex={0}
      >
        <img
          src={getOptimizedImageUrl(primaryImage, { width: 400 })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Floating School Logo Badge — Prioritizes emblem over text */}
        {schoolLogo && (
          <div
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs p-1 shadow-md border border-sand-300 z-10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110"
            title={school?.name}
          >
            <img
              src={schoolLogo}
              alt={school?.name || 'School Emblem'}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-2.5 right-2.5 bg-crimson-600 text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded shadow-sm z-10 pointer-events-none">
            {discountPercent}% OFF
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="bg-cream-50 text-navy-800 font-serif font-bold text-xs uppercase px-3 py-1 rounded-full border border-sand-300 shadow-md">
              Out of stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm">
            Only {totalStock} left
          </span>
        ) : null}
      </Link>

      {/* Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-cream-50">
        <div>
          {/* School Emblem + Name & Garment Category */}
          <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {schoolLogo && (
                <div className="w-5 h-5 rounded-[4px] bg-white border border-sand-300 p-0.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                  <img
                    src={schoolLogo}
                    alt=""
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}
              <span className="text-xs font-serif italic text-brass-text tracking-wide truncate">
                {school?.name || 'Academic Uniform'}
              </span>
            </div>
            {(product.itemType || product.season) && (
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate bg-sand-200 px-1.5 py-0.5 rounded border border-sand-300 shrink-0">
                {product.itemType || (product.season === 'all' ? 'All-season' : product.season)}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif font-bold text-sm sm:text-base text-navy-800 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing and Action */}
        <div className="relative pt-2 border-t border-sand-300 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-serif font-bold text-navy-800 tracking-tight">
                {hasVariablePrice ? 'From ' : ''}₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp && product.mrp > displayPrice && (
                <span className="text-xs text-taupe-500 line-through font-sans">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-xs text-emerald-800 font-serif italic block">
              Official Dye Lot
            </span>
          </div>

          <button
            onClick={handleQuickAddClick}
            disabled={isOutOfStock}
            className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isOutOfStock
                ? 'bg-sand-200 text-slate/50 border border-sand-300 cursor-not-allowed'
                : 'bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-cream-50 border border-navy-700 shadow-sm'
            }`}
            aria-label={hasVariants ? `Options - ${product.name}` : `Add to Bag - ${product.name}`}
            aria-haspopup={!hasVariants && product.sizes.length > 1 ? 'true' : undefined}
            aria-expanded={showSizePicker}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cream-50" />
            <span>{hasVariants ? 'Options' : 'Add'}<span className="hidden sm:inline">{hasVariants ? '' : ' to Bag'}</span></span>
          </button>
        </div>
      </div>

      {/* In-Card Size Selection Overlay - prevents clipping from card boundaries */}
      {showSizePicker && (
        <div
          ref={popoverRef}
          className="absolute inset-0 bg-cream-50 z-30 p-3.5 sm:p-4 rounded-[10px] flex flex-col justify-between border border-sand-300 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="Select uniform size"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-sand-300 shrink-0">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-serif italic font-bold text-navy-800 block truncate">
                Select Size
              </span>
              <span className="text-[11px] text-slate font-sans block truncate max-w-[160px] sm:max-w-[200px]">
                {product.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSizePicker(false)}
              className="p-1 text-slate hover:text-navy-800 rounded-md min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-sand-200 transition-colors"
              aria-label="Close size selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Size Grid with prices */}
          <div className="my-2 flex-1 overflow-y-auto min-h-0 pr-0.5 space-y-1">
            <div className="grid grid-cols-3 gap-1.5">
              {product.sizes.map((s) => {
                const isOOS = (s.stock || 0) <= 0;
                const sizePrice = s.price || displayPrice;
                return (
                  <button
                    key={s.label}
                    type="button"
                    disabled={isOOS}
                    onClick={() => handleAddToCart(s.label)}
                    className={`min-h-[44px] py-1.5 px-2 rounded-[6px] text-xs font-mono font-bold transition-all border flex flex-col items-center justify-center ${
                      isOOS
                        ? 'bg-sand-200 text-slate/40 border-sand-300 line-through cursor-not-allowed'
                        : 'bg-cream-100 hover:bg-navy-800 hover:text-cream-50 text-navy-800 border-sand-300 shadow-xs active:scale-95'
                    }`}
                    aria-label={`Size ${s.label}, ₹${sizePrice}`}
                  >
                    <span>{s.label}</span>
                    <span className="text-[10px] font-sans font-normal opacity-80">
                      ₹{sizePrice.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guidance / Cancel footer */}
          <div className="pt-2 border-t border-sand-300 flex items-center justify-between text-xs shrink-0">
            <span className="text-[11px] text-slate font-serif italic">
              Tap a size to add
            </span>
            <button
              type="button"
              onClick={() => setShowSizePicker(false)}
              className="text-xs font-semibold text-crimson-600 hover:text-navy-800 transition-colors py-1 px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
