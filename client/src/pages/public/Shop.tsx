import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { useProducts, useSchools, useCategories } from '../../api';
import { ProductCard } from '../../components/product/ProductCard';
import { Skeleton } from '../../components/ui/Skeleton';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract params from URL
  const q = searchParams.get('q') || '';
  const school = searchParams.get('school') || '';
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: schools } = useSchools();
  const { data: categories } = useCategories();

  const queryParams: Record<string, any> = {
    page,
    limit: 16,
    sort,
  };
  if (q) queryParams.q = q;
  if (school) queryParams.school = school;
  if (category) queryParams.category = category;
  if (gender) queryParams.gender = gender;

  const { data: productsData, isLoading } = useProducts(queryParams);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  const hasActiveFilters = !!(q || school || category || gender);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>Shop School & Institutional Uniforms | Indraprasth Uniforms Bhopal</title>
        <meta
          name="description"
          content="Explore Bhopal's widest catalogue of official school uniforms, winter blazers, pants, sweaters and institutional apparel."
        />
      </Helmet>

      {/* Header and Filter summary */}
      <div className="border-b border-sand-300 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block mb-1">
            Certified Catalog Since 1975
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
            Official Uniform Catalog
          </h1>
          <p className="text-sm text-slate font-sans mt-1">
            Displaying {productsData?.total || 0} tailored items
            {q && (
              <span>
                {' '}
                for <strong className="text-navy-800 font-semibold">"{q}"</strong>
              </span>
            )}
          </p>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-cream-50 border border-sand-300 rounded-[8px] text-xs font-semibold text-navy-800 shadow-subtle min-h-[44px] btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Refine {hasActiveFilters && '(Active)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-serif italic text-slate hidden sm:block">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs sm:text-sm font-medium border border-sand-300 bg-cream-50 rounded-[8px] px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-subtle"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-cream-50 rounded-[10px] border border-sand-300 p-5 shadow-plinth space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-sand-300">
              <h3 className="font-serif font-bold text-base text-navy-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filter Catalog</span>
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-crimson-700 hover:text-navy-800 font-serif italic font-semibold focus-visible:ring-1 focus-visible:ring-crimson-600"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* School Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold">
                Institution
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => updateParam('school', '')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium transition-colors btn-tactile min-h-[38px] ${
                    !school
                      ? 'bg-blue-100 text-navy-800 border-l-[3px] border-blue-600 font-serif font-bold shadow-xs'
                      : 'text-ink hover:bg-sand-200 font-sans'
                  }`}
                >
                  All Partner Schools
                </button>
                {schools?.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => updateParam('school', s.slug)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium flex items-center justify-between transition-colors btn-tactile min-h-[38px] ${
                      school === s.slug
                        ? 'bg-blue-100 text-navy-800 border-l-[3px] border-blue-600 font-serif font-bold shadow-xs'
                        : 'text-ink hover:bg-sand-200 font-sans'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-navy-800 px-1.5 py-0.5 rounded ml-2 border border-blue-600/30">
                      {s.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2 pt-4 border-t border-sand-300">
              <h4 className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold">
                Category
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium transition-colors btn-tactile min-h-[38px] ${
                    !category
                      ? 'bg-blue-100 text-navy-800 border-l-[3px] border-blue-600 font-serif font-bold shadow-xs'
                      : 'text-ink hover:bg-sand-200 font-sans'
                  }`}
                >
                  All Uniform Categories
                </button>
                {categories?.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => updateParam('category', c.slug)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium transition-colors btn-tactile min-h-[38px] ${
                      category === c.slug
                        ? 'bg-blue-100 text-navy-800 border-l-[3px] border-blue-600 font-serif font-bold shadow-xs'
                        : 'text-ink hover:bg-sand-200 font-sans'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2 pt-4 border-t border-sand-300">
              <h4 className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold">
                Fit / Department
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'All', val: '' },
                  { label: 'Boys', val: 'boys' },
                  { label: 'Girls', val: 'girls' },
                  { label: 'Unisex', val: 'unisex' },
                ].map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => updateParam('gender', g.val)}
                    className={`text-xs px-3 py-1.5 rounded-[8px] font-medium transition-all btn-tactile text-center min-h-[36px] ${
                      gender === g.val
                        ? 'bg-navy-800 text-cream-50 font-serif font-bold shadow-xs'
                        : 'bg-cream-100 border border-sand-300 text-ink hover:bg-cream-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-80 rounded-[10px]" />
              ))}
            </div>
          ) : productsData && productsData.items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {productsData.items.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-cream-50 rounded-[10px] border border-sand-300 p-12 text-center space-y-4 shadow-plinth">
              <div className="w-16 h-16 rounded-[10px] bg-sand-200 text-navy-800 flex items-center justify-center mx-auto border border-sand-300">
                <Filter className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-navy-800">No uniforms found</h3>
              <p className="text-sm text-slate max-w-sm mx-auto font-sans">
                We could not find items matching your current filter selections.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-navy-800 text-cream-50 rounded-[8px] font-medium text-xs sm:text-sm hover:bg-navy-700 transition-colors btn-tactile shadow-sm min-h-[44px]"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-sand-300">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                className="px-4 py-2 rounded-[8px] text-xs sm:text-sm font-medium border border-sand-300 bg-cream-50 hover:bg-sand-200 disabled:opacity-40 disabled:cursor-not-allowed btn-tactile min-h-[44px]"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm text-slate font-mono px-3">
                Page {productsData.page} of {productsData.totalPages}
              </span>
              <button
                disabled={page >= productsData.totalPages}
                onClick={() => updateParam('page', String(page + 1))}
                className="px-4 py-2 rounded-[8px] text-xs sm:text-sm font-medium border border-sand-300 bg-cream-50 hover:bg-sand-200 disabled:opacity-40 disabled:cursor-not-allowed btn-tactile min-h-[44px]"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-cream-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-sand-300 text-ink">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-sand-300">
                  <h3 className="font-serif font-bold text-lg text-navy-800">Refine Catalog</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-[8px] text-slate hover:text-navy-800 btn-tactile"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* School */}
                <div className="space-y-2">
                  <h4 className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold">
                    Institution
                  </h4>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => updateParam('school', '')}
                      className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium min-h-[38px] ${
                        !school ? 'bg-blue-100 text-navy-800 font-serif font-bold border-l-[3px] border-blue-600' : 'text-ink hover:bg-sand-200'
                      }`}
                    >
                      All Partner Schools
                    </button>
                    {schools?.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => updateParam('school', s.slug)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium flex items-center justify-between min-h-[38px] ${
                          school === s.slug ? 'bg-blue-100 text-navy-800 font-serif font-bold border-l-[3px] border-blue-600' : 'text-ink hover:bg-sand-200'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="font-mono text-[10px] bg-blue-100 px-1 rounded text-navy-800">{s.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2 pt-4 border-t border-sand-300">
                  <h4 className="text-xs font-serif uppercase tracking-widest text-brass-text font-bold">
                    Category
                  </h4>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => updateParam('category', '')}
                      className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium min-h-[38px] ${
                        !category ? 'bg-blue-100 text-navy-800 font-serif font-bold border-l-[3px] border-blue-600' : 'text-ink hover:bg-sand-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories?.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => updateParam('category', c.slug)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-[8px] font-medium min-h-[38px] ${
                          category === c.slug ? 'bg-blue-100 text-navy-800 font-serif font-bold border-l-[3px] border-blue-600' : 'text-ink hover:bg-sand-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-sand-300 space-y-2">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-cream-50 rounded-[8px] font-serif font-bold text-sm shadow-md btn-tactile min-h-[44px]"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 text-slate font-serif italic text-xs hover:text-navy-800 min-h-[36px]"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
