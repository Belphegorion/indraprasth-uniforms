import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/cart';

describe('Client Cart Store (Zustand)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart and subtotal of 0', () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.getSubtotal()).toBe(0);
    expect(state.getTotalItems()).toBe(0);
  });

  it('adds an item to cart and calculates subtotal', () => {
    useCartStore.getState().addItem({
      productId: 'prod-1',
      name: 'DPS Winter Blazer',
      price: 1650,
      size: '32',
      qty: 1,
      image: 'https://example.com/blazer.jpg',
      schoolCode: 'DPS',
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('DPS Winter Blazer');
    expect(state.items[0].qty).toBe(1);
    expect(state.getSubtotal()).toBe(1650);
    expect(state.getTotalItems()).toBe(1);
  });

  it('increments quantity when adding same product with same size', () => {
    const item = {
      productId: 'prod-1',
      name: 'DPS Winter Blazer',
      price: 1650,
      size: '32',
      image: 'https://example.com/blazer.jpg',
    };

    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem({ ...item, qty: 2 });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(3);
    expect(state.getSubtotal()).toBe(1650 * 3);
    expect(state.getTotalItems()).toBe(3);
  });

  it('treats different sizes of same product as distinct cart lines', () => {
    const item = {
      productId: 'prod-1',
      name: 'DPS Winter Blazer',
      price: 1650,
      image: 'https://example.com/blazer.jpg',
    };

    useCartStore.getState().addItem({ ...item, size: '30', qty: 1 });
    useCartStore.getState().addItem({ ...item, size: '32', qty: 1 });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.getSubtotal()).toBe(3300);
    expect(state.getTotalItems()).toBe(2);
  });

  it('updates item quantity and removes item when qty set to 0', () => {
    useCartStore.getState().addItem({
      productId: 'prod-1',
      name: 'DPS Winter Tie',
      price: 100,
      size: 'Standard',
      qty: 2,
      image: 'https://example.com/tie.jpg',
    });

    useCartStore.getState().updateQty('prod-1', 'Standard', 5);
    expect(useCartStore.getState().items[0].qty).toBe(5);
    expect(useCartStore.getState().getSubtotal()).toBe(500);

    useCartStore.getState().updateQty('prod-1', 'Standard', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getSubtotal()).toBe(0);
  });

  it('removes item explicitly via removeItem', () => {
    useCartStore.getState().addItem({
      productId: 'prod-1',
      name: 'DPS Winter Socks',
      price: 90,
      size: 'Medium',
      qty: 1,
      image: 'https://example.com/socks.jpg',
    });

    useCartStore.getState().removeItem('prod-1', 'Medium');
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
