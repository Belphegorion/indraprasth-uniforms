import { describe, it, expect } from 'vitest';
import { orderCreateSchema } from '@indraprasth/shared';

describe('Checkout Form & Order Validation Schema', () => {
  const validHomeDeliveryOrder = {
    customer: {
      name: 'Priya Sharma',
      phone: '9826012345',
      email: 'priya@example.com',
      address: {
        line1: 'Flat 202, Nilgiri Towers, Arera Colony',
        city: 'Bhopal',
        pincode: '462016',
      },
    },
    items: [
      {
        productId: '507f1f77bcf86cd799439011',
        size: '30',
        qty: 2,
      },
    ],
    paymentMethod: 'cod' as const,
    fulfilment: 'home_delivery' as const,
    notes: 'Please call before delivery',
  };

  it('accepts a valid home delivery order', () => {
    const result = orderCreateSchema.safeParse(validHomeDeliveryOrder);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid Indian phone number', () => {
    const invalidPhoneOrder = {
      ...validHomeDeliveryOrder,
      customer: {
        ...validHomeDeliveryOrder.customer,
        phone: '12345', // Not 10 digits starting with 6-9
      },
    };

    const result = orderCreateSchema.safeParse(invalidPhoneOrder);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid PIN code', () => {
    const invalidPinOrder = {
      ...validHomeDeliveryOrder,
      customer: {
        ...validHomeDeliveryOrder.customer,
        address: {
          line1: 'Line 1',
          city: 'Bhopal',
          pincode: '4620', // Less than 6 digits
        },
      },
    };

    const result = orderCreateSchema.safeParse(invalidPinOrder);
    expect(result.success).toBe(false);
  });

  it('rejects home delivery if address is omitted', () => {
    const missingAddressOrder = {
      ...validHomeDeliveryOrder,
      customer: {
        name: 'Priya Sharma',
        phone: '9826012345',
        // address omitted
      },
      fulfilment: 'home_delivery' as const,
    };

    const result = orderCreateSchema.safeParse(missingAddressOrder);
    expect(result.success).toBe(false);
  });

  it('accepts store pickup without address when pickup branch is selected', () => {
    const validStorePickupOrder = {
      customer: {
        name: 'Vikas Dubey',
        phone: '9826098765',
      },
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          size: '32',
          qty: 1,
        },
      ],
      paymentMethod: 'pay_at_store' as const,
      fulfilment: 'store_pickup' as const,
      pickupBranch: 'Jawahar Chowk (HQ)',
    };

    const result = orderCreateSchema.safeParse(validStorePickupOrder);
    expect(result.success).toBe(true);
  });

  it('rejects store pickup if pickupBranch is omitted', () => {
    const missingBranchOrder = {
      customer: {
        name: 'Vikas Dubey',
        phone: '9826098765',
      },
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          size: '32',
          qty: 1,
        },
      ],
      paymentMethod: 'pay_at_store' as const,
      fulfilment: 'store_pickup' as const,
      pickupBranch: '', // empty
    };

    const result = orderCreateSchema.safeParse(missingBranchOrder);
    expect(result.success).toBe(false);
  });

  it('rejects orders with empty items array', () => {
    const emptyItemsOrder = {
      ...validHomeDeliveryOrder,
      items: [],
    };

    const result = orderCreateSchema.safeParse(emptyItemsOrder);
    expect(result.success).toBe(false);
  });
});
