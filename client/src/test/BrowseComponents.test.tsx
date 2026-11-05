import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SchoolRail } from '../components/home/SchoolRail';
import { ActiveChips } from '../components/home/ActiveChips';
import { BrowseProductCard } from '../components/home/BrowseProductCard';
import { IProduct, ISchool } from '@indraprasth/shared';

const mockSchool: ISchool & { productCount?: number } = {
  id: 'school-1',
  _id: 'school-1',
  name: 'Delhi Public School Bhopal',
  code: 'DPS',
  slug: 'dps-bhopal',
  isActive: true,
  productCount: 14,
};

const mockProduct: IProduct = {
  _id: 'prod-1',
  name: 'DPS Winter Blazer',
  slug: 'dps-winter-blazer',
  description: 'Official woollen blazer',
  price: 1650,
  mrp: 1850,
  school: mockSchool,
  category: { id: 'c1', name: 'Winter-ware', slug: 'winter-ware', isActive: true, sortOrder: 1 },
  images: [{ url: 'https://example.com/blazer.jpg', publicId: 'img1' }],
  sizes: [
    { label: '32', stock: 12 },
    { label: '34', stock: 4 },
  ],
  gender: 'unisex',
  season: 'winter',
  typeGroup: 'outerwear',
  itemType: 'Blazer',
  isActive: true,
  isFeatured: true,
};

describe('Browse Components', () => {
  describe('SchoolRail', () => {
    it('renders school list with item counts and calls onSelectSchool when clicked', () => {
      const handleSelect = vi.fn();
      render(
        <SchoolRail
          schools={[mockSchool]}
          selectedSchoolSlug="dps-bhopal"
          onSelectSchool={handleSelect}
          totalAllSchoolsCount={24}
        />
      );

      // Desktop rail shows All Schools and DPS
      expect(screen.getAllByText('All Schools').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Delhi Public School Bhopal').length).toBeGreaterThan(0);
      expect(screen.getAllByText('14').length).toBeGreaterThan(0);

      // Click All Schools
      fireEvent.click(screen.getAllByText('All Schools')[0]);
      expect(handleSelect).toHaveBeenCalledWith('all');
    });
  });

  describe('ActiveChips', () => {
    it('renders active chips and triggers removal and clear all', () => {
      const handleRemove = vi.fn();
      const handleClear = vi.fn();

      render(
        <ActiveChips
          chips={[
            { id: 'c1', category: 'gender', value: 'boys', label: 'Boys' },
            { id: 'c2', category: 'season', value: 'winter', label: 'Winter' },
          ]}
          onRemoveChip={handleRemove}
          onClearAll={handleClear}
        />
      );

      expect(screen.getByText('Boys')).toBeDefined();
      expect(screen.getByText('Winter')).toBeDefined();

      // Click clear all
      const clearBtn = screen.getByLabelText('Clear all active filters');
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalled();

      // Click remove single chip
      const removeBtn = screen.getByLabelText('Remove filter Boys');
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'boys', label: 'Boys' })
      );
    });
  });

  describe('BrowseProductCard', () => {
    it('renders product details, stock, item type, price and opens size popover on Add', () => {
      render(
        <MemoryRouter>
          <BrowseProductCard product={mockProduct} />
        </MemoryRouter>
      );

      expect(screen.getByText('DPS Winter Blazer')).toBeDefined();
      expect(screen.getByText('Blazer')).toBeDefined();
      expect(screen.getByText('₹1,650')).toBeDefined();
      expect(screen.getByText('₹1,850')).toBeDefined();

      // Click Add button to open size picker popover
      const addBtn = screen.getByLabelText('Add DPS Winter Blazer to bag');
      fireEvent.click(addBtn);

      // Size options popover should now be visible
      expect(screen.getByRole('dialog', { name: 'Select uniform size' })).toBeDefined();
      expect(screen.getByText('32')).toBeDefined();
      expect(screen.getByText('34')).toBeDefined();
    });
  });
});
