import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { lazyWithRetry } from '../utils/lazyWithRetry';

describe('lazyWithRetry utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders lazily loaded component successfully on happy path', async () => {
    const MockComponent: React.FC = () => <div>Lazy Loaded Content</div>;
    const Component = lazyWithRetry(async () => ({ default: MockComponent }), 'TestComp');

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    );

    expect(await screen.findByText('Lazy Loaded Content')).toBeDefined();
  });

  it('handles chunk load error by scheduling window reload once', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });

    const failedFactory = vi.fn().mockRejectedValue(
      new TypeError('Failed to fetch dynamically imported module: https://example.com/assets/Inquiries.js')
    );

    const Component = lazyWithRetry(failedFactory, 'InquiriesTest');

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    );

    // Give microtasks time to execute
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('indraprasth_retry_InquiriesTest')).toBe('true');
  });
});
