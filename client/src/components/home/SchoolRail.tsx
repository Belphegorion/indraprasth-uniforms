import React, { useState, useMemo } from 'react';
import { Search, GraduationCap, Building2 } from 'lucide-react';
import { ISchool } from '@indraprasth/shared';
import { getSchoolLogoUrl, getSchoolShortLabel } from '../../utils/schoolLogos';

interface SchoolRailProps {
  schools: (ISchool & { productCount?: number })[];
  selectedSchoolSlug: string;
  onSelectSchool: (schoolSlugOrCode: string) => void;
  totalAllSchoolsCount?: number;
}

export const SchoolRail: React.FC<SchoolRailProps> = ({
  schools,
  selectedSchoolSlug,
  onSelectSchool,
  totalAllSchoolsCount = 0,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  // Filter out ghost schools with 0 products (e.g. STJ without catalogue entries)
  const activeSchools = useMemo(() => {
    return schools.filter((s) => s.productCount === undefined || s.productCount > 0);
  }, [schools]);

  // Filter schools list when search query is entered
  const filteredSchools = useMemo(() => {
    if (!filterQuery.trim()) return activeSchools;
    const q = filterQuery.toLowerCase();
    return activeSchools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.branchLabel && s.branchLabel.toLowerCase().includes(q))
    );
  }, [activeSchools, filterQuery]);

  const isAllSelected = !selectedSchoolSlug || selectedSchoolSlug === 'all';

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP RAIL (>=1024px): Sticky left sidebar (≈260px)   */}
      {/* ======================================================== */}
      <nav
        aria-label="Schools"
        className="hidden lg:block w-[260px] shrink-0 sticky top-28 self-start bg-cream-50 rounded-[10px] border border-sand-300 shadow-subtle p-3.5 space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-sand-300">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-serif font-bold text-sm text-navy-800 uppercase tracking-wide">
              Schools
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate bg-sand-200 px-2 py-0.5 rounded-full">
            {activeSchools.length}
          </span>
        </div>

        {/* Search input when school list > 8 */}
        {activeSchools.length > 8 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-taupe-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find school..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-[8px] border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-cream-100 text-ink placeholder:text-taupe-500"
              aria-label="Filter school list"
            />
          </div>
        )}

        {/* School List */}
        <div
          role="radiogroup"
          aria-label="School selection"
          className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1"
        >
          {/* "All Schools" option */}
          <button
            type="button"
            role="radio"
            aria-checked={isAllSelected}
            onClick={() => onSelectSchool('all')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-left text-xs transition-all min-h-[44px] btn-tactile ${
              isAllSelected
                ? 'bg-blue-100 border-l-[3px] border-blue-600 text-navy-800 font-bold shadow-xs'
                : 'hover:bg-sand-200 text-ink'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                  isAllSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-sand-200 text-navy-800'
                }`}
              >
                All
              </span>
              <span className="truncate font-medium">All Schools</span>
            </div>
            {totalAllSchoolsCount > 0 && (
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                  isAllSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-sand-200 text-slate'
                }`}
              >
                {totalAllSchoolsCount}
              </span>
            )}
          </button>

          {/* Individual Schools */}
          {filteredSchools.map((s) => {
            const isSelected =
              selectedSchoolSlug.toLowerCase() === s.slug.toLowerCase() ||
              selectedSchoolSlug.toLowerCase() === s.code.toLowerCase();
            const logoUrl = getSchoolLogoUrl(s);

            return (
              <button
                key={s._id || s.slug}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectSchool(s.slug)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-left text-xs transition-all min-h-[44px] btn-tactile ${
                  isSelected
                    ? 'bg-blue-100 border-l-[3px] border-blue-600 text-navy-800 font-bold shadow-xs'
                    : 'hover:bg-sand-200 text-ink'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {logoUrl ? (
                    <div className="w-8 h-8 rounded-[6px] bg-white border border-sand-300 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                      <img
                        src={logoUrl}
                        alt={s.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <span className="block truncate font-serif font-bold text-xs">{s.name}</span>
                    {s.branchLabel && (
                      <span className="text-[11px] text-slate font-serif italic block truncate">
                        {s.branchLabel} Campus
                      </span>
                    )}
                  </div>
                </div>

                {s.productCount !== undefined && (
                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-sand-200 text-slate'
                    }`}
                  >
                    {s.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ======================================================== */}
      {/* TABLET & MOBILE RAIL (<1024px): Phone mode school logos  */}
      {/* ======================================================== */}
      <nav
        aria-label="Schools mobile selection"
        className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2"
      >
        {/* All Schools Pill */}
        <button
          type="button"
          onClick={() => onSelectSchool('all')}
          aria-pressed={isAllSelected}
          aria-label="All Schools"
          className={`shrink-0 inline-flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full text-xs font-semibold min-h-[44px] transition-all btn-tactile border ${
            isAllSelected
              ? 'bg-navy-800 text-cream-50 shadow-sm border-navy-700'
              : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              isAllSelected ? 'bg-cream-50/20 text-cream-50' : 'bg-sand-200 text-navy-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
          </div>
          <span>All Schools</span>
          {totalAllSchoolsCount > 0 && (
            <span
              className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${
                isAllSelected ? 'bg-cream-50/20 text-cream-50' : 'bg-sand-200 text-slate'
              }`}
            >
              {totalAllSchoolsCount}
            </span>
          )}
        </button>

        {/* School Pills with Official Logos */}
        {activeSchools.map((s) => {
          const isSelected =
            selectedSchoolSlug.toLowerCase() === s.slug.toLowerCase() ||
            selectedSchoolSlug.toLowerCase() === s.code.toLowerCase();
          const logoUrl = getSchoolLogoUrl(s);

          return (
            <button
              key={s._id || s.slug}
              type="button"
              onClick={() => onSelectSchool(s.slug)}
              aria-pressed={isSelected}
              aria-label={`Select ${s.name}`}
              title={s.name}
              className={`shrink-0 inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-xs font-semibold min-h-[44px] transition-all btn-tactile border ${
                isSelected
                  ? 'bg-navy-800 text-cream-50 shadow-md border-navy-700'
                  : 'bg-cream-50 text-navy-800 border-sand-300 hover:bg-sand-200 shadow-xs'
              }`}
            >
              {logoUrl ? (
                <div className="w-8 h-8 rounded-full bg-white p-1 border border-sand-300 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                  <img
                    src={logoUrl}
                    alt={s.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : null}
              {/* Phone mode: Uses official school logo and recognizable institution name */}
              <span className="font-serif text-xs font-semibold tracking-tight">
                {getSchoolShortLabel(s)}
              </span>
              {s.productCount !== undefined && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-cream-50/20 text-cream-50' : 'bg-sand-200 text-slate'
                  }`}
                >
                  {s.productCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
