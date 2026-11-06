import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { IProduct, ISchool, ICategory } from '@indraprasth/shared';
import { useCartStore } from '../../store/cart';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import toast from 'react-hot-toast';

interface BrowseProductCardProps {
  product: IProduct;
}

export const BrowseProductCard: React.FC<BrowseProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const [showSizePicker, setShowSizePicker] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const school = product.school as ISchool;
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

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
          <div className="flex flex-wrap gap-1">
            {school?.code && (
              <span className="bg-blue-100 text-navy-800 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded shadow-sm border border-blue-600/30 tracking-wide">
                {school.code}
              </span>
            )}
            {product.itemType && (
              <span className="bg-cream-50/90 backdrop-blur-sm text-navy-800 text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm border border-sand-300">
                {product.itemType}
              </span>
            )}
          </div>

          {discountPercent && (
            <span className="bg-crimson-600 text-white text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="bg-cream-50 text-navy-800 font-serif font-bold text-xs uppercase px-3 py-1 rounded-full border border-sand-300 shadow-md">
              Out of stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
            Only {totalStock} left
          </span>
        ) : null}
      </Link>

      {/* Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-cream-50">
        <div>
          {/* School Name & Garment Category */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-serif italic text-brass-text tracking-wide truncate max-w-[150px]">
              {school?.name || 'Academic Uniform'}
            </span>
            {product.season && (
              <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate bg-sand-200 px-1.5 py-0.5 rounded border border-sand-300">
                {product.season === 'all' ? 'All-season' : product.season}
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
            <span className="text-[10px] text-emerald-800 font-serif italic block">
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
            aria-label={hasVariants ? `View options for ${product.name}` : `Add ${product.name} to bag`}
            aria-haspopup={!hasVariants && product.sizes.length > 1 ? 'true' : undefined}
            aria-expanded={showSizePicker}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cream-50" />
            <span>{hasVariants ? 'Options' : 'Add'}<span className="hidden sm:inline">{hasVariants ? '' : ' to Bag'}</span></span>
          </button>

          {/* Quick Size Picker Popover */}
          {showSizePicker && (
            <div
              ref={popoverRef}
              className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150"
              role="dialog"
              aria-label="Select uniform size"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-sand-300">
                <span className="text-xs font-serif italic font-bold text-navy-800">
                  Select Size
                </span>
                <button
                  onClick={() => setShowSizePicker(false)}
                  className="p-1 text-slate hover:text-navy-800 rounded-md"
                  aria-label="Close size selector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {product.sizes.map((s) => {
                  const isOOS = (s.stock || 0) <= 0;
                  return (
                    <button
                      key={s.label}
                      disabled={isOOS}
                      onClick={() => handleAddToCart(s.label)}
                      className={`min-h-[36px] py-1.5 px-2 rounded-[6px] text-xs font-mono font-bold transition-all border ${
                        isOOS
                          ? 'bg-sand-200 text-slate/40 border-sand-300 line-through cursor-not-allowed'
                          : 'bg-cream-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-navy-800 border-sand-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
