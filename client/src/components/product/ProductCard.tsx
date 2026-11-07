import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { IProduct, ISchool, ICategory } from '@indraprasth/shared';
import { useCartStore } from '../../store/cart';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0]?.label || product.variants?.[0]?.sizes?.[0]?.label || ''
  );
  const [, setShowSizePicker] = useState(false);

  const school = product.school as ISchool;
  const category = product.category as ICategory;
  const primaryImage =
    product.images[0]?.url ||
    product.variants?.[0]?.images?.[0]?.url ||
    'https://res.cloudinary.com/dvaynkflu/image/upload/v1791370845/indraprasth/products/ngfiqedvngrgzvuc12td.png';

  const totalStock = hasVariants
    ? product.variants!.reduce((acc, v) => acc + (v.sizes?.reduce((sAcc, s) => sAcc + (s.stock || 0), 0) || 0), 0)
    : (product.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) || 0);
  const isOutOfStock = totalStock <= 0;

  const allPrices = hasVariants
    ? product.variants!.flatMap((v) => v.sizes?.map((s) => s.price).filter((p): p is number => typeof p === 'number' && p > 0) || [])
    : (product.sizes?.map((s) => s.price).filter((p): p is number => typeof p === 'number' && p > 0) || []);

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : product.price;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : product.price;
  const hasVariablePrice = minPrice !== maxPrice || hasVariants || (product.sizes && product.sizes.length > 1 && allPrices.length > 1);
  const displayPrice = minPrice || product.price;

  // Calculate discount percentage if MRP exists
  const discountPercent =
    product.mrp && product.mrp > displayPrice
      ? Math.round(((product.mrp - displayPrice) / product.mrp) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (hasVariants) {
      window.location.href = `/product/${product.slug}`;
      return;
    }

    if (!selectedSize && product.sizes.length > 1) {
      setShowSizePicker(true);
      return;
    }

    const currentSizeObj = product.sizes.find((s) => s.label === selectedSize);
    const itemPrice = currentSizeObj?.price || displayPrice;
    const sizeToAdd = selectedSize || product.sizes[0]?.label || 'Standard';

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

  return (
    <div className="group relative bg-cream-50 rounded-[10px] border border-sand-300 shadow-plinth hover:shadow-plinth-hover hover:border-brass transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/5] bg-cream-100 overflow-hidden border-b border-sand-300">
        <img
          src={getOptimizedImageUrl(primaryImage, { width: 500 })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />


        {/* Stock status indicator */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="bg-cream-50 text-navy-800 font-serif font-bold text-xs uppercase px-3 py-1 rounded-full border border-sand-300 shadow-md">
              Temporarily Sold Out
            </span>
          </div>
        ) : totalStock <= 5 ? (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
            Only {totalStock} left
          </span>
        ) : null}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-cream-50">
        <div>
          {/* School Name & Category */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-serif italic text-brass-text tracking-wide truncate max-w-[150px]">
              {school?.name || 'Academic Uniform'}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate bg-sand-200 px-1.5 py-0.5 rounded border border-sand-300">
              {category?.name || 'Official'}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif font-bold text-base text-navy-800 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Sizes Quick Selection or Colour Variants */}
        {hasVariants ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate">
              <span className="font-serif italic">Available Options:</span>
              <span className="font-mono font-semibold text-navy-800">{product.variants!.length} Colours</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.variants!.slice(0, 4).map((v, i) => (
                <span
                  key={i}
                  className="text-[10px] font-sans px-2 py-0.5 rounded-[4px] bg-sand-200 text-navy-800 border border-sand-300 capitalize"
                >
                  {v.colorName}
                </span>
              ))}
              {product.variants!.length > 4 && (
                <span className="text-[10px] font-mono text-slate self-center">
                  +{product.variants!.length - 4} more
                </span>
              )}
            </div>
          </div>
        ) : product.sizes.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate">
              <span className="font-serif italic">Size:</span>
              <span className="font-mono font-semibold text-navy-800">{selectedSize || 'Select'}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s.label;
                const isSizeOOS = s.stock <= 0;
                return (
                  <button
                    key={s.label}
                    type="button"
                    disabled={isSizeOOS}
                    onClick={() => setSelectedSize(s.label)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-[4px] border transition-colors btn-tactile ${
                      isSelected
                        ? 'bg-navy-800 text-cream-50 border-navy-700 font-bold shadow-xs'
                        : isSizeOOS
                        ? 'bg-sand-200 text-slate/40 border-sand-300 line-through cursor-not-allowed'
                        : 'bg-cream-100 text-navy-800 border-sand-300 hover:border-blue-600 hover:bg-cream-50'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-sand-300 flex items-center justify-between gap-2">
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
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`min-h-[44px] px-3 py-2 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition-all btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isOutOfStock
                ? 'bg-sand-200 text-slate/50 border border-sand-300 cursor-not-allowed'
                : 'bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-cream-50 border border-navy-700 shadow-sm'
            }`}
            aria-label={hasVariants ? `View options for ${product.name}` : `Add ${product.name} to bag`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cream-50" />
            <span className="hidden sm:inline">{hasVariants ? 'View Options' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
