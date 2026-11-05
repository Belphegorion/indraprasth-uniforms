import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ShoppingBag, ArrowRight, Award } from 'lucide-react';
import { useSchools, useProducts } from '../../api';
import { ProductCard } from '../../components/product/ProductCard';
import { Modal } from '../../components/ui/Modal';
import { useCartStore } from '../../store/cart';
import { IProduct, ICategory } from '@indraprasth/shared';
import toast from 'react-hot-toast';

export const SchoolPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: schools } = useSchools();
  const school = schools?.find((s) => s.slug === slug || s.code.toLowerCase() === slug?.toLowerCase());

  const { data: productsData, isLoading } = useProducts({
    school: slug,
    limit: 50,
  });

  const { addItem } = useCartStore();
  const [fullSetModalOpen, setFullSetModalOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const products = productsData?.items || [];

  // Group items by category name
  const groupedCategories: Record<string, IProduct[]> = {};
  for (const item of products) {
    const catName = (item.category as ICategory)?.name || 'General Uniform';
    if (!groupedCategories[catName]) {
      groupedCategories[catName] = [];
    }
    groupedCategories[catName].push(item);
  }

  // Pre-fill default sizes for full set helper
  React.useEffect(() => {
    if (products.length > 0) {
      const defaults: Record<string, string> = {};
      for (const p of products) {
        const id = (p._id || p.id) as string;
        const available = p.sizes.find((s) => s.stock > 0);
        defaults[id] = available ? available.label : p.sizes[0]?.label || 'Standard';
      }
      setSelectedSizes(defaults);
    }
  }, [products]);

  const handleAddFullSet = () => {
    let count = 0;
    for (const p of products) {
      const id = (p._id || p.id) as string;
      const size = selectedSizes[id] || p.sizes[0]?.label || 'Standard';
      addItem({
        productId: id,
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        size,
        qty: 1,
        image: p.images[0]?.url || '',
        schoolCode: school?.code,
        schoolName: school?.name,
      });
      count++;
    }
    setFullSetModalOpen(false);
    toast.success(`Added complete uniform set (${count} items) to your bag!`, {
      icon: '🎉',
      style: {
        background: '#0E2747',
        color: '#FBF8F2',
        border: '1px solid #14407A',
        fontFamily: 'Inter',
      },
    });
  };

  const fullSetTotal = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Helmet>
        <title>{`${school ? school.name : 'School'} Uniforms | Indraprasth Uniforms Bhopal`}</title>
        <meta
          name="description"
          content={`Official uniform catalogue for ${school?.name || 'Bhopal schools'}. Purchase complete sets with home delivery across Bhopal.`}
        />
      </Helmet>

      {/* School Header Banner — Academic Heraldry */}
      <div className="relative rounded-[10px] bg-navy-900 border border-navy-700 text-cream-50 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-navy-800 border border-navy-700 text-cream-50 text-xs font-serif font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-brass" />
            <span>Official Institution Regulation Store</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            {school?.name || 'Academic Uniforms'}
          </h1>

          <p className="text-sand-200 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
            Certified regulation uniform specifications for the current academic session. Guaranteed institutional dye-lot compliance, double-stitched reinforcements, and shrink-resistant thermal winter woollens.
          </p>

          <div className="pt-3 flex flex-wrap gap-4 items-center">
            {products.length > 0 && (
              <button
                onClick={() => setFullSetModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[8px] bg-crimson-600 hover:bg-crimson-700 active:bg-crimson-800 text-white font-medium text-sm shadow-md transition-all btn-tactile min-h-[44px] focus-visible:ring-2 focus-visible:ring-crimson-600"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Add Full Uniform Set ({products.length} Items)</span>
              </button>
            )}

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-[8px] bg-cream-50 hover:bg-sand-200 text-navy-800 border border-sand-300 text-xs sm:text-sm font-medium transition-colors btn-tactile min-h-[44px]"
            >
              <span>Explore other institutions</span>
              <ArrowRight className="w-4 h-4 text-navy-800" />
            </Link>
          </div>
        </div>
      </div>

      {/* Products Grouped By Category */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((n) => (
            <div key={n} className="space-y-4">
              <div className="h-6 w-40 bg-sand-200 rounded animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-72 bg-cream-50 rounded-[10px] border border-sand-300 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedCategories).length === 0 ? (
        <div className="bg-cream-50 rounded-[10px] border border-sand-300 p-12 text-center space-y-3 shadow-plinth">
          <p className="text-slate text-sm font-serif italic">No items currently catalogued for this school.</p>
          <Link to="/shop" className="text-xs font-serif font-bold text-blue-600 hover:underline">
            Browse full uniform directory →
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedCategories).map(([categoryName, items]) => (
            <section key={categoryName} className="space-y-5">
              <div className="border-b border-sand-300 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block">
                    Regulation Segment
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800">
                    {categoryName}
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate bg-sand-200 px-2 py-0.5 rounded-[4px] border border-sand-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {items.map((prod) => (
                  <ProductCard key={prod._id || prod.slug} product={prod} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Full Set Helper Modal */}
      <Modal
        isOpen={fullSetModalOpen}
        onClose={() => setFullSetModalOpen(false)}
        title={`Add Complete ${school?.code || ''} Uniform Set`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 text-ink">
          <p className="text-xs text-slate font-sans">
            Select your child's size for each prescribed item below. The entire coordinated uniform kit will be added to your shopping bag in a single click.
          </p>

          <div className="divide-y divide-sand-300 max-h-96 overflow-y-auto pr-2 space-y-3">
            {products.map((p) => {
              const id = (p._id || p.id) as string;
              return (
                <div key={id} className="pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]?.url}
                      alt=""
                      className="w-12 h-14 object-cover rounded-[6px] bg-cream-100 shrink-0 border border-sand-300"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-navy-800 line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-xs font-serif font-bold text-navy-800">₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Size Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-serif italic text-slate hidden sm:block">Size:</label>
                    <select
                      value={selectedSizes[id] || p.sizes[0]?.label}
                      onChange={(e) =>
                        setSelectedSizes({ ...selectedSizes, [id]: e.target.value })
                      }
                      className="text-xs font-mono border border-sand-300 rounded-[6px] p-1.5 bg-cream-50 text-navy-800 shadow-subtle"
                    >
                      {p.sizes.map((s) => (
                        <option key={s.label} value={s.label} disabled={s.stock <= 0}>
                          {s.label} {s.stock <= 0 ? '(Sold out)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-sand-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate font-serif italic block">Combined Kit Total:</span>
              <span className="text-2xl font-serif font-bold text-navy-800">₹{fullSetTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={handleAddFullSet}
              className="w-full sm:w-auto px-7 py-3.5 rounded-[8px] bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-cream-50 font-medium text-sm shadow-md flex items-center justify-center gap-2 btn-tactile border border-navy-700 min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-cream-50" />
              <span>Add Complete Kit to Bag</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
