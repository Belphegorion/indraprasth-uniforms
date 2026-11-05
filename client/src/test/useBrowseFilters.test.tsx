import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useBrowseFilters } from '../hooks/useBrowseFilters';

const wrapper = ({ children, initialEntries = ['/'] }: { children: React.ReactNode; initialEntries?: string[] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
);

describe('useBrowseFilters hook', () => {
  it('parses initial filter state correctly from URL search params', () => {
    const { result } = renderHook(() => useBrowseFilters(), {
      wrapper: ({ children }) =>
        wrapper({
          children,
          initialEntries: [
            '/?school=dps&gender=boys,girls&season=winter&typeGroup=tops&itemType=shirt&size=30&minPrice=500&maxPrice=1500&inStock=true&sort=price_asc&page=2',
          ],
        }),
    });

    expect(result.current.filters.school).toBe('dps');
    expect(result.current.filters.gender).toEqual(['boys', 'girls']);
    expect(result.current.filters.season).toEqual(['winter']);
    expect(result.current.filters.typeGroup).toEqual(['tops']);
    expect(result.current.filters.itemType).toEqual(['shirt']);
    expect(result.current.filters.size).toEqual(['30']);
    expect(result.current.filters.minPrice).toBe(500);
    expect(result.current.filters.maxPrice).toBe(1500);
    expect(result.current.filters.inStock).toBe(true);
    expect(result.current.filters.sort).toBe('price_asc');
    expect(result.current.filters.page).toBe(2);
  });

  it('updates school and resets page to 1', () => {
    const { result } = renderHook(() => useBrowseFilters(), {
      wrapper: ({ children }) => wrapper({ children, initialEntries: ['/?school=dps&page=3'] }),
    });

    act(() => {
      result.current.setSchool('st-joseph');
    });

    expect(result.current.filters.school).toBe('st-joseph');
    expect(result.current.filters.page).toBe(1);
  });

  it('toggles array filters on and off', () => {
    const { result } = renderHook(() => useBrowseFilters(), {
      wrapper: ({ children }) => wrapper({ children, initialEntries: ['/'] }),
    });

    // Toggle on
    act(() => {
      result.current.toggleFilter('season', 'winter');
    });
    expect(result.current.filters.season).toEqual(['winter']);

    // Toggle another
    act(() => {
      result.current.toggleFilter('season', 'summer');
    });
    expect(result.current.filters.season).toEqual(['winter', 'summer']);

    // Toggle off winter
    act(() => {
      result.current.toggleFilter('season', 'winter');
    });
    expect(result.current.filters.season).toEqual(['summer']);
  });

  it('generates active filter chips and allows single removal', () => {
    const { result } = renderHook(() => useBrowseFilters(), {
      wrapper: ({ children }) =>
        wrapper({
          children,
          initialEntries: ['/?gender=boys&season=winter&inStock=true'],
        }),
    });

    expect(result.current.activeChips).toHaveLength(3);
    const chipLabels = result.current.activeChips.map((c) => c.label);
    expect(chipLabels).toContain('Boys');
    expect(chipLabels).toContain('Winter');
    expect(chipLabels).toContain('In Stock Only');

    // Remove gender chip
    act(() => {
      result.current.removeFilter('gender', 'boys');
    });

    expect(result.current.filters.gender).toEqual([]);
    expect(result.current.activeChips.some((c) => c.category === 'gender')).toBe(false);
  });

  it('clears all filters while preserving the selected school', () => {
    const { result } = renderHook(() => useBrowseFilters(), {
      wrapper: ({ children }) =>
        wrapper({
          children,
          initialEntries: ['/?school=dps&gender=boys&season=winter&typeGroup=tops&inStock=true'],
        }),
    });

    expect(result.current.filters.school).toBe('dps');
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearAllFilters();
    });

    // School is retained!
    expect(result.current.filters.school).toBe('dps');
    // Other filters cleared
    expect(result.current.filters.gender).toEqual([]);
    expect(result.current.filters.season).toEqual([]);
    expect(result.current.filters.typeGroup).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
