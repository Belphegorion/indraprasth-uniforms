import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  IBrowseFacets,
  IBrowseFilterState,
  IBrowseFacetValue,
  ProductGender,
  ProductSeason,
  ProductTypeGroup,
} from '@indraprasth/shared';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: IBrowseFilterState;
  facets?: IBrowseFacets;
  onApply: (draftFilters: Partial<IBrowseFilterState>) => void;
  onReset: () => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  facets,
  onApply,
  onReset,
}) => {
  const [draftGender, setDraftGender] = useState<ProductGender[]>(filters.gender);
  const [draftSeason, setDraftSeason] = useState<ProductSeason[]>(filters.season);
  const [draftTypeGroup, setDraftTypeGroup] = useState<ProductTypeGroup[]>(filters.typeGroup);
  const [draftItemType, setDraftItemType] = useState<string[]>(filters.itemType);
  const [draftSize, setDraftSize] = useState<string[]>(filters.size);
  const [draftMinPrice, setDraftMinPrice] = useState<number | undefined>(filters.minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState<number | undefined>(filters.maxPrice);
  const [draftInStock, setDraftInStock] = useState<boolean>(Boolean(filters.inStock));

  useEffect(() => {
    if (isOpen) {
      setDraftGender(filters.gender);
      setDraftSeason(filters.season);
      setDraftTypeGroup(filters.typeGroup);
      setDraftItemType(filters.itemType);
      setDraftSize(filters.size);
      setDraftMinPrice(filters.minPrice);
      setDraftMaxPrice(filters.maxPrice);
      setDraftInStock(Boolean(filters.inStock));
    }
  }, [isOpen, filters]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDraft = <T extends string>(
    currentList: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    val: T
  ) => {
    setter(
      currentList.includes(val)
        ? currentList.filter((item) => item !== val)
        : [...currentList, val]
    );
  };

  const handleApply = () => {
    onApply({
      gender: draftGender,
      season: draftSeason,
      typeGroup: draftTypeGroup,
      itemType: draftItemType,
      size: draftSize,
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
      inStock: draftInStock,
    });
    onClose();
  };

  const handleReset = () => {
    setDraftGender([]);
    setDraftSeason([]);
    setDraftTypeGroup([]);
    setDraftItemType([]);
    setDraftSize([]);
    setDraftMinPrice(undefined);
    setDraftMaxPrice(undefined);
    setDraftInStock(false);
    onReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Filter uniform products"
    >
      <div className="flex-1" onClick={onClose} />

      <div className="bg-cream-50 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-sand-300 animate-in slide-in-from-bottom duration-300 text-ink">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-300 bg-cream-50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif font-bold text-base text-navy-800">
              Filter Uniforms
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate hover:text-navy-800 rounded-full hover:bg-sand-200 btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Close filter drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* In-Stock Toggle */}
          <div className="flex items-center justify-between p-3 rounded-[10px] bg-sand-200/50 border border-sand-300">
            <span className="text-xs font-bold text-navy-800">
              In Stock Only
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={draftInStock}
                onChange={(e) => setDraftInStock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sand-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-xs font-serif font-bold text-navy-800 uppercase tracking-wider mb-2.5">
              Gender
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['boys', 'girls', 'unisex'] as ProductGender[]).map((g) => {
                const count = facets?.gender?.find((f) => f.value.toLowerCase() === g)?.count ?? 0;
                const isSelected = draftGender.includes(g);
                const disabled = count === 0 && !isSelected;

                return (
                  <button
                    key={g}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDraft(draftGender, setDraftGender, g)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-[8px] text-xs font-semibold capitalize border transition-all btn-tactile ${
                      isSelected
                        ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs font-bold'
                        : disabled
                        ? 'bg-sand-200 text-slate/40 border-sand-300 cursor-not-allowed opacity-60'
                        : 'bg-cream-50 text-navy-800 border-sand-300 hover:border-blue-600'
                    }`}
                  >
                    {g} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Season */}
          <div>
            <h3 className="text-xs font-serif font-bold text-navy-800 uppercase tracking-wider mb-2.5">
              Season
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['winter', 'summer', 'all'] as ProductSeason[]).map((s) => {
                const count = facets?.season?.find((f) => f.value.toLowerCase() === s)?.count ?? 0;
                const isSelected = draftSeason.includes(s);
                const disabled = count === 0 && !isSelected;
                const label = s === 'all' ? 'All-season' : s;

                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDraft(draftSeason, setDraftSeason, s)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-[8px] text-xs font-semibold capitalize border transition-all btn-tactile ${
                      isSelected
                        ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs font-bold'
                        : disabled
                        ? 'bg-sand-200 text-slate/40 border-sand-300 cursor-not-allowed opacity-60'
                        : 'bg-cream-50 text-navy-800 border-sand-300 hover:border-blue-600'
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Garment Type Group */}
          <div>
            <h3 className="text-xs font-serif font-bold text-navy-800 uppercase tracking-wider mb-2.5">
              Garment Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['tops', 'bottoms', 'footwear', 'outerwear', 'accessories'] as ProductTypeGroup[]).map((tg) => {
                const count = facets?.typeGroup?.find((f) => f.value.toLowerCase() === tg)?.count ?? 0;
                const isSelected = draftTypeGroup.includes(tg);
                const disabled = count === 0 && !isSelected;

                return (
                  <button
                    key={tg}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDraft(draftTypeGroup, setDraftTypeGroup, tg)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-[8px] text-xs font-semibold capitalize border transition-all btn-tactile ${
                      isSelected
                        ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs font-bold'
                        : disabled
                        ? 'bg-sand-200 text-slate/40 border-sand-300 cursor-not-allowed opacity-60'
                        : 'bg-cream-50 text-navy-800 border-sand-300 hover:border-blue-600'
                    }`}
                  >
                    {tg} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Type (Sub-type) */}
          {facets?.itemType && facets.itemType.length > 0 && (
            <div>
              <h3 className="text-xs font-serif font-bold text-navy-800 uppercase tracking-wider mb-2.5">
                Item
              </h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {facets.itemType.map((it: IBrowseFacetValue) => {
                  const valLower = it.value.toLowerCase();
                  const isSelected = draftItemType.includes(valLower);
                  const disabled = it.count === 0 && !isSelected;

                  return (
                    <button
                      key={it.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleDraft(draftItemType, setDraftItemType, it.value)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-[8px] text-xs font-semibold border transition-all btn-tactile ${
                        isSelected
                          ? 'bg-blue-100 text-navy-800 border-blue-600/40 shadow-xs font-bold'
                          : disabled
                          ? 'bg-sand-200 text-slate/40 border-sand-300 cursor-not-allowed opacity-60'
                          : 'bg-cream-50 text-navy-800 border-sand-300 hover:border-blue-600'
                      }`}
                    >
                      {it.value} ({it.count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size */}
          {facets?.size && facets.size.length > 0 && (
            <div>
              <h3 className="text-xs font-serif font-bold text-navy-800 uppercase tracking-wider mb-2.5">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {facets.size.map((sz: IBrowseFacetValue) => {
                  const valLower = sz.value.toLowerCase();
                  const isSelected = draftSize.includes(valLower);
                  const disabled = sz.count === 0 && !isSelected;

                  return (
                    <button
                      key={sz.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleDraft(draftSize, setDraftSize, sz.value)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-[8px] text-xs font-mono font-bold border transition-all btn-tactile ${
                        isSelected
                          ? 'bg-navy-800 text-cream-50 border-navy-700 shadow-sm'
                          : disabled
                          ? 'bg-sand-200 text-slate/40 border-sand-300 cursor-not-allowed opacity-60'
                          : 'bg-cream-50 text-navy-800 border-sand-300 hover:border-blue-600'
                      }`}
                    >
                      {sz.value} ({sz.count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range Slider / Inputs */}
          {facets?.price && (
            <div>
              <h3 className="text-xs font-serif font-bold text-navy-800 uppercase tracking-wider mb-2.5">
                Price Range
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-slate font-mono block mb-1">
                    Min (₹)
                  </label>
                  <input
                    type="number"
                    min={facets.price.min}
                    max={draftMaxPrice || facets.price.max}
                    value={draftMinPrice ?? facets.price.min}
                    onChange={(e) =>
                      setDraftMinPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full text-xs px-3 py-2 rounded-[8px] border border-sand-300 bg-cream-100 text-ink focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <span className="text-taupe-500 mt-4">—</span>
                <div className="flex-1">
                  <label className="text-[10px] text-slate font-mono block mb-1">
                    Max (₹)
                  </label>
                  <input
                    type="number"
                    min={draftMinPrice || facets.price.min}
                    max={facets.price.max}
                    value={draftMaxPrice ?? facets.price.max}
                    onChange={(e) =>
                      setDraftMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full text-xs px-3 py-2 rounded-[8px] border border-sand-300 bg-cream-100 text-ink focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-sand-300 bg-sand-200/50 flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] border border-sand-300 bg-cream-50 text-navy-800 font-bold text-xs hover:bg-sand-200 transition-colors btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-navy-800 hover:bg-navy-700 text-cream-50 font-bold text-xs shadow-md transition-all btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
