import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IBrowseFilterState,
  ProductGender,
  ProductSeason,
  ProductTypeGroup,
} from '@indraprasth/shared';

export interface ActiveFilterChip {
  id: string;
  category: 'gender' | 'season' | 'typeGroup' | 'itemType' | 'size' | 'price' | 'inStock' | 'q';
  value: string;
  label: string;
}

const parseArrayParam = (paramVal: string | null): string[] => {
  if (!paramVal) return [];
  return paramVal
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

export const useBrowseFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state from URL
  const filters: IBrowseFilterState = useMemo(() => {
    const school = searchParams.get('school') || undefined;
    const q = searchParams.get('q') || undefined;
    const gender = parseArrayParam(searchParams.get('gender')) as ProductGender[];
    const season = parseArrayParam(searchParams.get('season')) as ProductSeason[];
    const typeGroup = parseArrayParam(searchParams.get('typeGroup')) as ProductTypeGroup[];
    const itemType = parseArrayParam(searchParams.get('itemType'));
    const size = parseArrayParam(searchParams.get('size'));
    const minPriceRaw = searchParams.get('minPrice');
    const maxPriceRaw = searchParams.get('maxPrice');
    const inStockRaw = searchParams.get('inStock');
    const sort = (searchParams.get('sort') || 'relevance') as
      | 'relevance'
      | 'price_asc'
      | 'price_desc'
      | 'newest'
      | 'name_asc';
    const pageRaw = searchParams.get('page');

    return {
      school,
      q,
      gender,
      season,
      typeGroup,
      itemType,
      size,
      minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
      inStock: inStockRaw === 'true',
      sort,
      page: pageRaw ? Math.max(1, parseInt(pageRaw, 10)) : 1,
    };
  }, [searchParams]);

  // Smooth scroll helper
  const scrollToSection = useCallback(() => {
    const el = document.getElementById('shop-by-school');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Update helper that sets searchParams
  const updateParams = useCallback(
    (
      updater: (prev: URLSearchParams) => URLSearchParams,
      options?: { resetPage?: boolean; scroll?: boolean }
    ) => {
      setSearchParams(
        (prev) => {
          const next = updater(new URLSearchParams(prev));
          if (options?.resetPage !== false) {
            next.set('page', '1');
          }
          return next;
        },
        { replace: true }
      );

      if (options?.scroll) {
        scrollToSection();
      }
    },
    [setSearchParams, scrollToSection]
  );

  const setSchool = useCallback(
    (schoolSlugOrCode: string) => {
      updateParams(
        (params) => {
          if (!schoolSlugOrCode || schoolSlugOrCode === 'all') {
            params.delete('school');
          } else {
            params.set('school', schoolSlugOrCode.toLowerCase());
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (q: string) => {
      updateParams(
        (params) => {
          const trimmed = q.trim();
          if (trimmed) {
            params.set('q', trimmed);
          } else {
            params.delete('q');
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const toggleFilter = useCallback(
    (
      category: 'gender' | 'season' | 'typeGroup' | 'itemType' | 'size',
      value: string
    ) => {
      updateParams(
        (params) => {
          const currentList = parseArrayParam(params.get(category));
          const valLower = value.toLowerCase();
          const nextList = currentList.includes(valLower)
            ? currentList.filter((item) => item !== valLower)
            : [...currentList, valLower];

          if (nextList.length > 0) {
            params.set(category, nextList.join(','));
          } else {
            params.delete(category);
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const removeFilter = useCallback(
    (
      category: 'gender' | 'season' | 'typeGroup' | 'itemType' | 'size' | 'price' | 'inStock' | 'q',
      value?: string
    ) => {
      updateParams(
        (params) => {
          if (category === 'price') {
            params.delete('minPrice');
            params.delete('maxPrice');
          } else if (category === 'inStock') {
            params.delete('inStock');
          } else if (category === 'q') {
            params.delete('q');
          } else if (value) {
            const currentList = parseArrayParam(params.get(category));
            const nextList = currentList.filter(
              (item) => item.toLowerCase() !== value.toLowerCase()
            );
            if (nextList.length > 0) {
              params.set(category, nextList.join(','));
            } else {
              params.delete(category);
            }
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const setPriceRange = useCallback(
    (minPrice?: number, maxPrice?: number) => {
      updateParams(
        (params) => {
          if (minPrice !== undefined && minPrice !== null) {
            params.set('minPrice', String(minPrice));
          } else {
            params.delete('minPrice');
          }

          if (maxPrice !== undefined && maxPrice !== null) {
            params.set('maxPrice', String(maxPrice));
          } else {
            params.delete('maxPrice');
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const setInStock = useCallback(
    (inStock: boolean) => {
      updateParams(
        (params) => {
          if (inStock) {
            params.set('inStock', 'true');
          } else {
            params.delete('inStock');
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const setSort = useCallback(
    (sort: string) => {
      updateParams(
        (params) => {
          if (sort && sort !== 'relevance') {
            params.set('sort', sort);
          } else {
            params.delete('sort');
          }
          return params;
        },
        { resetPage: true, scroll: false }
      );
    },
    [updateParams]
  );

  const setPage = useCallback(
    (page: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (page > 1) {
            next.set('page', String(page));
          } else {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
      scrollToSection();
    },
    [setSearchParams, scrollToSection]
  );

  // Clear all filters except school
  const clearAllFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const currentSchool = prev.get('school');
        if (currentSchool) {
          next.set('school', currentSchool);
        }
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // Compute active chips
  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    filters.gender.forEach((g) => {
      chips.push({
        id: `gender-${g}`,
        category: 'gender',
        value: g,
        label: g.charAt(0).toUpperCase() + g.slice(1),
      });
    });

    filters.season.forEach((s) => {
      chips.push({
        id: `season-${s}`,
        category: 'season',
        value: s,
        label: s === 'all' ? 'All-season' : s.charAt(0).toUpperCase() + s.slice(1),
      });
    });

    filters.typeGroup.forEach((tg) => {
      chips.push({
        id: `typeGroup-${tg}`,
        category: 'typeGroup',
        value: tg,
        label: tg.charAt(0).toUpperCase() + tg.slice(1),
      });
    });

    filters.itemType.forEach((it) => {
      chips.push({
        id: `itemType-${it}`,
        category: 'itemType',
        value: it,
        label: it.charAt(0).toUpperCase() + it.slice(1),
      });
    });

    filters.size.forEach((sz) => {
      chips.push({
        id: `size-${sz}`,
        category: 'size',
        value: sz,
        label: `Size ${sz}`,
      });
    });

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice ?? 0;
      const max = filters.maxPrice ?? '∞';
      chips.push({
        id: 'price-range',
        category: 'price',
        value: `${min}-${max}`,
        label: `₹${min} - ₹${max}`,
      });
    }

    if (filters.inStock) {
      chips.push({
        id: 'in-stock',
        category: 'inStock',
        value: 'true',
        label: 'In Stock Only',
      });
    }

    if (filters.q) {
      chips.push({
        id: 'search-q',
        category: 'q',
        value: filters.q,
        label: `"${filters.q}"`,
      });
    }

    return chips;
  }, [filters]);

  return {
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
    hasActiveFilters: activeChips.length > 0,
    scrollToSection,
  };
};
