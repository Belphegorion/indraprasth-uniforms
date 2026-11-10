import React, { useMemo } from 'react';
import {
  Sparkles,
  MessageCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useBrowseFilters } from '../../hooks/useBrowseFilters';
import { useBrowseProducts, useBrowseSchools, usePublicSettings } from '../../api';
import { SchoolRail } from './SchoolRail';
import { FilterBar } from './FilterBar';
import { BrowseProductCard } from './BrowseProductCard';
import { Skeleton } from '../ui/Skeleton';
import { getSchoolLogoUrl } from '../../utils/schoolLogos';

export const SchoolShopSection: React.FC = () => {
  const {
    filters,
    setSchool,
    setSearch,
    toggleFilter,
    removeFilter,
    setPriceRange,
    setInStock,
    setSort,
    setPage,
    clearAllFilters,
    activeChips,
  } = useBrowseFilters();

  // Fetch schools with active product counts
  const { data: schools = [] } = useBrowseSchools();

  // Fetch products with browse filters & facets
  const {
    data: browseData,
    isLoading,
    isFetching,
  } = useBrowseProducts({
    school: filters.school,
    q: filters.q,
    gender: filters.gender,
    season: filters.season,
    typeGroup: filters.typeGroup,
    itemType: filters.itemType,
    size: filters.size,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock,
    sort: filters.sort,
    page: filters.page,
    limit: 12,
  });

  const { data: settings } = usePublicSettings();
  const whatsappNumber =
    settings?.whatsappNumber || settings?.phones?.[0] || '919826000000';

  const products = browseData?.items || [];
  const pagination = browseData?.pagination;
  const facets = browseData?.facets;

  // Selected school name resolution
  const selectedSchoolObj = useMemo(() => {
    if (!filters.school || filters.school === 'all') return null;
    const currentSchool = filters.school.toLowerCase();
    return schools.find(
      (s) =>
        s.slug.toLowerCase() === currentSchool ||
        s.code.toLowerCase() === currentSchool
    );
  }, [schools, filters.school]);

  const schoolTitle = selectedSchoolObj
    ? selectedSchoolObj.name
    : 'All Schools';

  const selectedSchoolLogo = selectedSchoolObj
    ? getSchoolLogoUrl(selectedSchoolObj)
    : null;

  // Total count across all schools
  const totalAllSchoolsCount = useMemo(() => {
    return schools.reduce((acc, s) => acc + (s.productCount || 0), 0);
  }, [schools]);

  // Handle batch apply from mobile filter sheet
  const handleApplyMobileFilters = (draft: any) => {
    if (draft.minPrice !== undefined || draft.maxPrice !== undefined) {
      setPriceRange(draft.minPrice, draft.maxPrice);
    }
    if (draft.inStock !== undefined) {
      setInStock(draft.inStock);
    }
    const categories = ['gender', 'season', 'typeGroup', 'itemType', 'size'] as const;
    categories.forEach((cat) => {
      if (draft[cat] !== undefined) {
        const currentVals = (filters as any)[cat] as string[];
        const nextVals = draft[cat] as string[];
        nextVals.forEach((v) => {
          if (!currentVals.includes(v)) toggleFilter(cat, v);
        });
        currentVals.forEach((v) => {
          if (!nextVals.includes(v)) toggleFilter(cat, v);
        });
      }
    });
  };

  return (
    <section
      id="shop-by-school"
      className="py-12 sm:py-16 bg-sand-200/50 border-t border-sand-300 scroll-mt-24"
      aria-label="Shop uniforms by school"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-600/30 text-navy-800 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AUTHORISED ACADEMIC ATTIRE</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-navy-800 tracking-tight">
            Shop by School
          </h2>
          <p className="text-xs sm:text-sm text-slate font-sans">
            Select your institution to browse official uniforms, blazers, and certified seasonal wear tailored to dress code regulations.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left School Rail */}
          <SchoolRail
            schools={schools}
            selectedSchoolSlug={filters.school || ''}
            onSelectSchool={setSchool}
            totalAllSchoolsCount={totalAllSchoolsCount}
          />

          {/* Right Main Column */}
          <main className="flex-1 w-full space-y-4">
            {/* Selected School Regulation Banner */}
            {selectedSchoolObj && (
              <div className="bg-blue-50/90 border border-blue-200/80 rounded-[10px] p-3.5 sm:p-4 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedSchoolLogo && (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[10px] bg-white border border-sand-300 p-1.5 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={selectedSchoolLogo}
                        alt={selectedSchoolObj.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-serif uppercase tracking-widest text-brass-text font-bold block">
                      Official Partner Institution
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-navy-800 truncate">
                      {selectedSchoolObj.name}
                    </h3>
                    {selectedSchoolObj.branchLabel && (
                      <p className="text-[11px] text-slate font-serif italic">
                        {selectedSchoolObj.branchLabel} Campus • Regulation Wear
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSchool('all')}
                  className="text-xs text-crimson-600 hover:text-crimson-700 font-serif italic font-semibold shrink-0"
                >
                  View All Schools
                </button>
              </div>
            )}

            {/* Top Bar with Search, Dropdowns, and Active Chips */}
            <FilterBar
              filters={filters}
              facets={facets}
              activeChips={activeChips}
              onSearchChange={setSearch}
              onToggleFilter={toggleFilter}
              onRemoveChip={(chip) => removeFilter(chip.category, chip.value)}
              onClearAll={clearAllFilters}
              onPriceRangeChange={setPriceRange}
              onInStockToggle={setInStock}
              onSortChange={setSort}
              onApplyFilters={handleApplyMobileFilters}
            />

            {/* Results Live Announcer & Count Header */}
            <div className="flex items-center justify-between px-1 py-1 text-xs">
              <div
                aria-live="polite"
                aria-atomic="true"
                className="font-serif italic text-slate"
              >
                {isLoading ? (
                  <span>Loading uniform apparel...</span>
                ) : pagination ? (
                  <span>
                    Showing <strong className="font-sans font-bold text-navy-800">{products.length}</strong> of{' '}
                    <strong className="font-sans font-bold text-navy-800">{pagination.total}</strong> items for{' '}
                    <strong className="text-blue-600 font-sans font-bold">{schoolTitle}</strong>
                  </span>
                ) : null}
              </div>

              {isFetching && !isLoading && (
                <span className="text-[10px] font-mono font-semibold text-blue-600 animate-pulse">
                  Updating...
                </span>
              )}
            </div>

            {/* Product Grid / Empty State */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-cream-50 rounded-[10px] border border-sand-300 p-3 space-y-3 shadow-subtle"
                  >
                    <Skeleton className="aspect-[4/5] w-full rounded-[8px]" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-5 w-16 rounded" />
                      <Skeleton className="h-8 w-16 rounded-[8px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Friendly Empty State */
              <div className="bg-cream-50 rounded-[10px] border border-sand-300 p-8 sm:p-12 text-center shadow-subtle space-y-4">
                <div className="w-14 h-14 mx-auto rounded-[10px] bg-sand-200 flex items-center justify-center text-slate">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="font-serif font-bold text-lg text-navy-800">
                    No matching uniform items found
                  </h3>
                  <p className="text-xs sm:text-sm text-slate">
                    We couldn't find items matching your current filters. Try resetting your criteria or connect with our Bhopal store directly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-sand-300 bg-cream-50 hover:bg-sand-200 text-navy-800 font-bold text-xs transition-colors min-h-[44px] btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <RotateCcw className="w-4 h-4 text-slate" />
                    <span>Clear Filters</span>
                  </button>

                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello Indraprasth Uniforms, I am inquiring about uniform availability for ${schoolTitle}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all min-h-[44px] btn-tactile focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {products.map((prod) => (
                  <BrowseProductCard
                    key={(prod._id || prod.id) as string}
                    product={prod}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-sand-300">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-semibold border transition-all min-h-[44px] btn-tactile ${
                    pagination.page <= 1
                      ? 'bg-sand-200 text-slate/50 border-sand-300 cursor-not-allowed'
                      : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200 shadow-subtle'
                  }`}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs font-mono text-slate">
                  Page <strong className="text-navy-800 font-bold">{pagination.page}</strong> of{' '}
                  <strong className="text-navy-800 font-bold">{pagination.pages}</strong>
                </div>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage(pagination.page + 1)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-semibold border transition-all min-h-[44px] btn-tactile ${
                    pagination.page >= pagination.pages
                      ? 'bg-sand-200 text-slate/50 border-sand-300 cursor-not-allowed'
                      : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200 shadow-subtle'
                  }`}
                  aria-label="Go to next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};
