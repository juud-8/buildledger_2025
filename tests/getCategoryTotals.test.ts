import { getCategoryTotals } from '../src/utils/calculations';
import { LineItem } from '../src/types';

describe('getCategoryTotals', () => {
  it('should correctly calculate category totals with markup', () => {
    const items: LineItem[] = [
      { id: '1', description: 'Lumber', category: 'material', quantity: 10, unit: 'ft', rate: 5, markup: 10, total: 0 },
      { id: '2', description: 'Labor', category: 'labor', quantity: 8, unit: 'hr', rate: 20, markup: 0, total: 0 },
      { id: '3', description: 'Excavator', category: 'equipment', quantity: 2, unit: 'day', rate: 100, markup: 5, total: 0 },
      { id: '4', description: 'Permit', category: 'other', quantity: 1, unit: 'each', rate: 50, markup: 0, total: 0 }
    ];

    const totals = getCategoryTotals(items);

    expect(totals.material).toBe(55);   // 10 * 5 = 50 + 10% = 55
    expect(totals.labor).toBe(160);     // 8 * 20 = 160
    expect(totals.equipment).toBe(210); // 2 * 100 = 200 + 5% = 210
    expect(totals.other).toBe(50);      // 1 * 50 = 50
  });
});
