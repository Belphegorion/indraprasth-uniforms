import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Home } from '../pages/public/Home';

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>();
  return {
    ...actual,
    useSchools: () => ({ data: [], isLoading: false }),
    useFeaturedProducts: () => ({ data: [], isLoading: false }),
    usePublicSettings: vi.fn(),
    useCategories: () => ({ data: [] }),
    useBrowseSchools: () => ({ data: [], isLoading: false }),
    useBrowseProducts: () => ({
      data: { items: [], total: 0, facets: { categories: [], types: [], seasons: [], genders: [] } },
      isLoading: false,
    }),
  };
});

import { usePublicSettings } from '../api';

describe('Home Hero Video', () => {
  it('renders default /new-video-hero.mp4 when no custom heroVideoUrl configured', () => {
    vi.mocked(usePublicSettings).mockReturnValue({
      data: {
        businessName: 'Indraprasth Uniforms',
        heroVideoUrl: undefined,
      },
    } as any);

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    const videoSource = container.querySelector('video source');
    expect(videoSource).not.toBeNull();
    expect(videoSource?.getAttribute('src')).toBe('/new-video-hero.mp4');
    expect(videoSource?.getAttribute('type')).toBe('video/mp4');
  });

  it('renders dynamic heroVideoUrl when configured in store settings', () => {
    vi.mocked(usePublicSettings).mockReturnValue({
      data: {
        businessName: 'Indraprasth Uniforms',
        heroVideoUrl: 'https://res.cloudinary.com/dvaynkflu/video/upload/custom-hero.mp4',
      },
    } as any);

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    const videoSource = container.querySelector('video source');
    expect(videoSource).not.toBeNull();
    expect(videoSource?.getAttribute('src')).toBe(
      'https://res.cloudinary.com/dvaynkflu/video/upload/custom-hero.mp4'
    );
    expect(videoSource?.getAttribute('type')).toBe('video/mp4');
  });

  it('renders default /new-video-hero.mp4 when heroVideoUrl is empty or only whitespace', () => {
    vi.mocked(usePublicSettings).mockReturnValue({
      data: {
        businessName: 'Indraprasth Uniforms',
        heroVideoUrl: '   ',
      },
    } as any);

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    const videoSource = container.querySelector('video source');
    expect(videoSource?.getAttribute('src')).toBe('/new-video-hero.mp4');
    expect(videoSource?.getAttribute('type')).toBe('video/mp4');
  });

  it('detects video/webm MIME type correctly for webm files with query params', () => {
    vi.mocked(usePublicSettings).mockReturnValue({
      data: {
        businessName: 'Indraprasth Uniforms',
        heroVideoUrl: 'https://res.cloudinary.com/dvaynkflu/video/upload/custom-hero.webm?v=123',
      },
    } as any);

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    const videoSource = container.querySelector('video source');
    expect(videoSource?.getAttribute('type')).toBe('video/webm');
  });

  it('provides an accessible play/pause toggle button satisfying WCAG 2.2.2', () => {
    vi.mocked(usePublicSettings).mockReturnValue({
      data: {
        businessName: 'Indraprasth Uniforms',
        heroVideoUrl: '/new-video-hero.mp4',
      },
    } as any);

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    const toggleBtn = container.querySelector('button[aria-label="Pause background hero video"]');
    expect(toggleBtn).not.toBeNull();
  });
});
