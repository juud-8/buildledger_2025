import { getCategoryTotals } from '../src/utils/calculations';
import { LineItem } from '../src/types';

const items: LineItem[] = [
  { id: '1', description: 'Lumber', category: 'material', quantity: 10, unit: 'ft', rate: 5, markup: 10, total: 0 },
  { id: '2', description: 'Labor', category: 'labor', quantity: 8, unit: 'hr', rate: 20, markup: 0, total: 0 },
  { id: '3', description: 'Excavator', category: 'equipment', quantity: 2, unit: 'day', rate: 100, markup: 5, total: 0 },
  { id: '4', description: 'Permit', category: 'other', quantity: 1, unit: 'each', rate: 50, markup: 0, total: 0 }
];

const totals = getCategoryTotals(items);

if (totals.material !== 55) throw new Error(`material expected 55 got ${totals.material}`);
if (totals.labor !== 160) throw new Error(`labor expected 160 got ${totals.labor}`);
if (totals.equipment !== 210) throw new Error(`equipment expected 210 got ${totals.equipment}`);
if (totals.other !== 50) throw new Error(`other expected 50 got ${totals.other}`);

console.log('getCategoryTotals tests passed.');
