import { getCategoryTotals } from '../src/utils/calculations';
import type { LineItem } from '../src/types';

describe('getCategoryTotals', () => {
  test('calculates totals for common categories', () => {
    const items: LineItem[] = [
      { id: '1', description: 'Lumber', category: 'material', quantity: 10, unit: 'ft', rate: 5, markup: 10, total: 0 },
      { id: '2', description: 'Labor', category: 'labor', quantity: 8, unit: 'hr', rate: 20, markup: 0, total: 0 },
      { id: '3', description: 'Excavator', category: 'equipment', quantity: 2, unit: 'day', rate: 100, markup: 5, total: 0 },
      { id: '4', description: 'Permit', category: 'other', quantity: 1, unit: 'each', rate: 50, markup: 0, total: 0 }
    ];

    const totals = getCategoryTotals(items);

    expect(totals).toEqual({ material: 55, labor: 160, equipment: 210, other: 50 });
  });

  test('stub', () => {
    expect(true).toBe(true);
  });
});
