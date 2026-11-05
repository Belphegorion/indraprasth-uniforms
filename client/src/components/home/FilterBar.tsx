import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import {
  IBrowseFacets,
  IBrowseFilterState,
  IBrowseFacetValue,
} from '@indraprasth/shared';
import { ActiveFilterChip } from '../../hooks/useBrowseFilters';
import { ActiveChips } from './ActiveChips';
import { FilterSheet } from './FilterSheet';

interface FilterBarProps {
  filters: IBrowseFilterState;
  facets?: IBrowseFacets;
  activeChips: ActiveFilterChip[];
  onSearchChange: (q: string) => void;
  onToggleFilter: (
    category: 'gender' | 'season' | 'typeGroup' | 'itemType' | 'size',
    value: string
  ) => void;
  onRemoveChip: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
  onPriceRangeChange: (min?: number, max?: number) => void;
  onInStockToggle: (inStock: boolean) => void;
  onSortChange: (sort: string) => void;
  onApplyFilters: (draftFilters: Partial<IBrowseFilterState>) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  facets,
  activeChips,
  onSearchChange,
  onToggleFilter,
  onRemoveChip,
  onClearAll,
  onPriceRangeChange,
  onInStockToggle,
  onSortChange,
  onApplyFilters,
}) => {
  const [searchInput, setSearchInput] = useState(filters.q || '');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(filters.q || '');
  }, [filters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.q || '')) {
        onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.q, onSearchChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openDropdown]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const [draftMinPrice, setDraftMinPrice] = useState<string>(
    filters.minPrice !== undefined ? String(filters.minPrice) : ''
  );
  const [draftMaxPrice, setDraftMaxPrice] = useState<string>(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ''
  );

  useEffect(() => {
    setDraftMinPrice(filters.minPrice !== undefined ? String(filters.minPrice) : '');
    setDraftMaxPrice(filters.maxPrice !== undefined ? String(filters.maxPrice) : '');
  }, [filters.minPrice, filters.maxPrice]);

  const handleApplyPrice = () => {
    const min = draftMinPrice ? Number(draftMinPrice) : undefined;
    const max = draftMaxPrice ? Number(draftMaxPrice) : undefined;
    onPriceRangeChange(min, max);
    setOpenDropdown(null);
  };

  const countFor = (
    category: 'gender' | 'season' | 'typeGroup' | 'itemType' | 'size',
    val: string
  ) => {
    const facetList = facets?.[category];
    const match = facetList?.find(
      (f: IBrowseFacetValue) => f.value.toLowerCase() === val.toLowerCase()
    );
    return match?.count ?? 0;
  };

  return (
    <div className="space-y-3">
      {/* Top Search & Filter Bar */}
      <div
        ref={dropdownRef}
        className="bg-cream-50 p-3 sm:p-4 rounded-[10px] border border-sand-300 shadow-subtle space-y-3"
      >
        {/* Row 1: Search, Mobile Filter Button, Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1" role="search">
            <Search className="w-4 h-4 text-taupe-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="browse-search-input"
              name="q"
              type="text"
              placeholder="Search by uniform name, item, or school..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-[8px] border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-cream-100 text-ink placeholder:text-taupe-500"
              aria-label="Search uniform products"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate hover:text-navy-800 rounded-md"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile / Tablet Filter Button (<1024px) */}
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="lg:hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-[8px] border border-sand-300 bg-cream-50 hover:bg-sand-200 text-navy-800 font-bold text-xs transition-colors shadow-subtle btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Open filter options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-crimson-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <label htmlFor="browse-sort" className="sr-only">
                Sort products by
              </label>
              <div className="relative min-w-[140px]">
                <ArrowUpDown className="w-3.5 h-3.5 text-taupe-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="browse-sort"
                  value={filters.sort}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full text-xs pl-8 pr-7 py-2.5 rounded-[8px] border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-cream-50 font-medium text-navy-800 appearance-none cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-taupe-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Desktop Filter Dropdowns (>=1024px) */}
        <div className="hidden lg:flex items-center flex-wrap gap-2 pt-2 border-t border-sand-300">
          {/* Gender Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('gender')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                filters.gender.length > 0
                  ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs'
                  : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
              }`}
              aria-haspopup="true"
              aria-expanded={openDropdown === 'gender'}
            >
              <span>Gender</span>
              {filters.gender.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center">
                  {filters.gender.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-taupe-500" />
            </button>

            {openDropdown === 'gender' && (
              <div className="absolute left-0 mt-1.5 w-44 p-2 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                {['boys', 'girls', 'unisex'].map((g) => {
                  const count = countFor('gender', g);
                  const isChecked = filters.gender.includes(g as any);
                  const disabled = count === 0 && !isChecked;

                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggleFilter('gender', g)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs capitalize text-left transition-colors ${
                        isChecked
                          ? 'bg-blue-100 font-bold text-navy-800'
                          : disabled
                          ? 'text-slate/40 cursor-not-allowed opacity-50'
                          : 'text-ink hover:bg-sand-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-sand-300'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>{g}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Season Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('season')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                filters.season.length > 0
                  ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs'
                  : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
              }`}
              aria-haspopup="true"
              aria-expanded={openDropdown === 'season'}
            >
              <span>Season</span>
              {filters.season.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center">
                  {filters.season.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-taupe-500" />
            </button>

            {openDropdown === 'season' && (
              <div className="absolute left-0 mt-1.5 w-44 p-2 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                {['winter', 'summer', 'all'].map((s) => {
                  const count = countFor('season', s);
                  const isChecked = filters.season.includes(s as any);
                  const disabled = count === 0 && !isChecked;
                  const label = s === 'all' ? 'All-season' : s;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggleFilter('season', s)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs capitalize text-left transition-colors ${
                        isChecked
                          ? 'bg-blue-100 font-bold text-navy-800'
                          : disabled
                          ? 'text-slate/40 cursor-not-allowed opacity-50'
                          : 'text-ink hover:bg-sand-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-sand-300'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>{label}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Type Group Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('typeGroup')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                filters.typeGroup.length > 0
                  ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs'
                  : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
              }`}
              aria-haspopup="true"
              aria-expanded={openDropdown === 'typeGroup'}
            >
              <span>Type</span>
              {filters.typeGroup.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center">
                  {filters.typeGroup.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-taupe-500" />
            </button>

            {openDropdown === 'typeGroup' && (
              <div className="absolute left-0 mt-1.5 w-48 p-2 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                {['tops', 'bottoms', 'footwear', 'outerwear', 'accessories'].map((tg) => {
                  const count = countFor('typeGroup', tg);
                  const isChecked = filters.typeGroup.includes(tg as any);
                  const disabled = count === 0 && !isChecked;

                  return (
                    <button
                      key={tg}
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggleFilter('typeGroup', tg)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs capitalize text-left transition-colors ${
                        isChecked
                          ? 'bg-blue-100 font-bold text-navy-800'
                          : disabled
                          ? 'text-slate/40 cursor-not-allowed opacity-50'
                          : 'text-ink hover:bg-sand-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-sand-300'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>{tg}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Item Sub-type Dropdown */}
          {facets?.itemType && facets.itemType.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('itemType')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                  filters.itemType.length > 0
                    ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs'
                    : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'itemType'}
              >
                <span>Item</span>
                {filters.itemType.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center">
                    {filters.itemType.length}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-taupe-500" />
              </button>

              {openDropdown === 'itemType' && (
                <div className="absolute left-0 mt-1.5 w-52 p-2 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-56 overflow-y-auto">
                  {facets.itemType.map((it: IBrowseFacetValue) => {
                    const isChecked = filters.itemType.includes(it.value.toLowerCase());
                    const disabled = it.count === 0 && !isChecked;

                    return (
                      <button
                        key={it.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggleFilter('itemType', it.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs text-left transition-colors ${
                          isChecked
                            ? 'bg-blue-100 font-bold text-navy-800'
                            : disabled
                            ? 'text-slate/40 cursor-not-allowed opacity-50'
                            : 'text-ink hover:bg-sand-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-sand-300'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span>{it.value}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate">
                          {it.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Size Dropdown */}
          {facets?.size && facets.size.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('size')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                  filters.size.length > 0
                    ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs'
                    : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'size'}
              >
                <span>Size</span>
                {filters.size.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-mono flex items-center justify-center">
                    {filters.size.length}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-taupe-500" />
              </button>

              {openDropdown === 'size' && (
                <div className="absolute left-0 mt-1.5 w-44 p-2 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-56 overflow-y-auto">
                  {facets.size.map((sz: IBrowseFacetValue) => {
                    const isChecked = filters.size.includes(sz.value.toLowerCase());
                    const disabled = sz.count === 0 && !isChecked;

                    return (
                      <button
                        key={sz.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggleFilter('size', sz.value)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs font-mono text-left transition-colors ${
                          isChecked
                            ? 'bg-blue-100 font-bold text-navy-800'
                            : disabled
                            ? 'text-slate/40 cursor-not-allowed opacity-50'
                            : 'text-ink hover:bg-sand-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-sand-300'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span>{sz.value}</span>
                        </span>
                        <span className="text-[10px] text-slate">
                          {sz.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Price Range Dropdown */}
          {facets?.price && (
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('price')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                  filters.minPrice !== undefined || filters.maxPrice !== undefined
                    ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs'
                    : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'price'}
              >
                <span>Price</span>
                <ChevronDown className="w-3 h-3 text-taupe-500" />
              </button>

              {openDropdown === 'price' && (
                <div className="absolute left-0 mt-1.5 w-60 p-3 bg-cream-50 rounded-[10px] border border-sand-300 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate block mb-0.5">
                        Min (₹)
                      </span>
                      <input
                        type="number"
                        placeholder={String(facets.price.min)}
                        value={draftMinPrice}
                        onChange={(e) => setDraftMinPrice(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-[6px] border border-sand-300 bg-cream-100 text-ink focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <span className="text-taupe-500 mt-4">—</span>
                    <div>
                      <span className="text-[10px] font-mono text-slate block mb-0.5">
                        Max (₹)
                      </span>
                      <input
                        type="number"
                        placeholder={String(facets.price.max)}
                        value={draftMaxPrice}
                        onChange={(e) => setDraftMaxPrice(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-[6px] border border-sand-300 bg-cream-100 text-ink focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-sand-300">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftMinPrice('');
                        setDraftMaxPrice('');
                        onPriceRangeChange(undefined, undefined);
                        setOpenDropdown(null);
                      }}
                      className="text-[11px] text-slate hover:text-navy-800 font-medium"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyPrice}
                      className="ml-auto px-3 py-1 rounded-[6px] bg-navy-800 text-cream-50 font-bold text-xs hover:bg-navy-700 transition-colors btn-tactile"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* In Stock Only Checkbox */}
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-semibold cursor-pointer select-none hover:bg-sand-200 border border-transparent transition-colors">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => onInStockToggle(e.target.checked)}
              className="rounded border-sand-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-navy-800">In stock only</span>
          </label>
        </div>

        {/* Active Filter Chips */}
        <ActiveChips
          chips={activeChips}
          onRemoveChip={onRemoveChip}
          onClearAll={onClearAll}
        />
      </div>

      {/* Mobile Filter Sheet */}
      <FilterSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        filters={filters}
        facets={facets}
        onApply={onApplyFilters}
        onReset={onClearAll}
      />
    </div>
  );
};
