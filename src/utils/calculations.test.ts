import { calculateCategoryTotals, calculateTaxBreakdown, calculateDiscountAmount } from './calculations';
import type { LineItem, Discount } from '../types';

describe('calculations utilities', () => {
  const lineItems: LineItem[] = [
    { id: '1', description: 'Wood', category: 'material', quantity: 2, unit: 'pcs', rate: 10, total: 20 },
    { id: '2', description: 'Labor', category: 'labor', quantity: 1, unit: 'hr', rate: 15, total: 15 },
    { id: '3', description: 'Excavator', category: 'equipment', quantity: 1, unit: 'unit', rate: 50, total: 50 },
    { id: '4', description: 'Permit', category: 'other', quantity: 1, unit: 'each', rate: 5, total: 5, taxRate: 5 }
  ];

  test('getCategoryTotals', () => {
    const totals = calculateCategoryTotals(lineItems);
    expect(totals).toEqual({
      materialSubtotal: 20,
      laborSubtotal: 15,
      equipmentSubtotal: 50,
      otherSubtotal: 5
    });
  });

  test('tax breakdown', () => {
    const taxes = calculateTaxBreakdown(lineItems, 8, 0, 8, 8);
    expect(taxes).toEqual({
      materialTax: 1.6,
      laborTax: 0,
      equipmentTax: 4,
      otherTax: 0.25,
      totalTax: 5.85
    });
  });

  test('discount calculations', () => {
    const discounts: Discount[] = [
      { type: 'percentage', value: 10, description: '10%', appliesTo: 'subtotal' },
      { type: 'fixed', value: 5, description: '$5 off materials', appliesTo: 'category', category: 'material' }
    ];

    const subtotal = 90;
    const total = 95.85;
    const amount = calculateDiscountAmount(subtotal, total, discounts, lineItems);
    expect(amount).toBe(14);
  });
});
