import { LineItem, Discount, TaxBreakdown, ProgressBilling } from '../types';

export const calculateLineItemTotal = (quantity: number, rate: number, markup: number = 0): number => {
  const baseTotal = quantity * rate;
  const markupAmount = baseTotal * (markup / 100);
  return Math.round((baseTotal + markupAmount) * 100) / 100;
};

export const calculateLineItemWithMarkup = (cost: number, markup: number): number => {
  return Math.round((cost * (1 + markup / 100)) * 100) / 100;
};

export const calculateCategorySubtotal = (lineItems: LineItem[], category: string): number => {
  return Math.round(
    lineItems
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.total, 0) * 100
  ) / 100;
};

export const calculateSubtotal = (lineItems: LineItem[]): number => {
  return Math.round(lineItems.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
};

import { CategoryTotals } from '../types';

export function getCategoryTotals(items: LineItem[]): CategoryTotals {
  const totals = items.reduce(
    (totals, item) => {
      const markup = item.markup ?? 0;
      const itemTotal = item.quantity * item.rate * (1 + markup / 100);

      switch (item.category) {
        case 'material':
          totals.material += itemTotal;
          break;
        case 'labor':
          totals.labor += itemTotal;
          break;
        case 'equipment':
          totals.equipment += itemTotal;
          break;
        default:
          totals.other += itemTotal;
          break;
      }

      return totals;
    },
    { material: 0, labor: 0, equipment: 0, other: 0 }
  );

  return {
    material: Math.round(totals.material * 100) / 100,
    labor: Math.round(totals.labor * 100) / 100,
    equipment: Math.round(totals.equipment * 100) / 100,
    other: Math.round(totals.other * 100) / 100
  };
}

export const calculateCategoryTotals = (lineItems: LineItem[]) => {
  const materialSubtotal = calculateCategorySubtotal(lineItems, 'material');
  const laborSubtotal = calculateCategorySubtotal(lineItems, 'labor');
  const equipmentSubtotal = calculateCategorySubtotal(lineItems, 'equipment');
  const otherSubtotal = lineItems
    .filter(item => !['material', 'labor', 'equipment'].includes(item.category))
    .reduce((sum, item) => sum + item.total, 0);

  return {
    materialSubtotal: Math.round(materialSubtotal * 100) / 100,
    laborSubtotal: Math.round(laborSubtotal * 100) / 100,
    equipmentSubtotal: Math.round(equipmentSubtotal * 100) / 100,
    otherSubtotal: Math.round(otherSubtotal * 100) / 100
  };
};

export const calculateTaxBreakdown = (
  lineItems: LineItem[],
  materialTaxRate: number,
  laborTaxRate: number,
  equipmentTaxRate: number,
  otherTaxRate: number
): TaxBreakdown => {
  const { materialSubtotal, laborSubtotal, equipmentSubtotal, otherSubtotal } = calculateCategoryTotals(lineItems);
  
  // Calculate tax for items with custom tax rates first
  let materialTax = 0;
  let laborTax = 0;
  let equipmentTax = 0;
  let otherTax = 0;
  
  lineItems.forEach(item => {
    const itemTaxRate = item.taxRate !== undefined ? item.taxRate : getDefaultTaxRate(item.category, materialTaxRate, laborTaxRate, equipmentTaxRate, otherTaxRate);
    const itemTax = item.total * (itemTaxRate / 100);
    
    switch (item.category) {
      case 'material':
        materialTax += itemTax;
        break;
      case 'labor':
        laborTax += itemTax;
        break;
      case 'equipment':
        equipmentTax += itemTax;
        break;
      default:
        otherTax += itemTax;
        break;
    }
  });

  const totalTax = materialTax + laborTax + equipmentTax + otherTax;

  return {
    materialTax: Math.round(materialTax * 100) / 100,
    laborTax: Math.round(laborTax * 100) / 100,
    equipmentTax: Math.round(equipmentTax * 100) / 100,
    otherTax: Math.round(otherTax * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100
  };
};

const getDefaultTaxRate = (
  category: string,
  materialTaxRate: number,
  laborTaxRate: number,
  equipmentTaxRate: number,
  otherTaxRate: number
): number => {
  switch (category) {
    case 'material':
      return materialTaxRate;
    case 'labor':
      return laborTaxRate;
    case 'equipment':
      return equipmentTaxRate;
    default:
      return otherTaxRate;
  }
};

export const calculateDiscountAmount = (
  subtotal: number,
  total: number,
  discounts: Discount[],
  lineItems: LineItem[]
): number => {
  let totalDiscount = 0;

  discounts.forEach(discount => {
    let discountBase = 0;
    
    switch (discount.appliesTo) {
      case 'subtotal':
        discountBase = subtotal;
        break;
      case 'total':
        discountBase = total;
        break;
      case 'category':
        if (discount.category) {
          discountBase = calculateCategorySubtotal(lineItems, discount.category);
        }
        break;
    }

    if (discount.type === 'percentage') {
      totalDiscount += discountBase * (discount.value / 100);
    } else {
      totalDiscount += discount.value;
    }
  });

  return Math.round(totalDiscount * 100) / 100;
};

export const calculateDepositAmount = (total: number, depositPercentage: number): number => {
  return Math.round((total * (depositPercentage / 100)) * 100) / 100;
};

export const calculateBalanceDue = (total: number, payments: { amount: number }[]): number => {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.round((total - totalPaid) * 100) / 100;
};

export const calculateProgressBillingTotal = (phases: ProgressBilling[]): number => {
  return Math.round(phases.reduce((sum, phase) => sum + phase.amount, 0) * 100) / 100;
};

export const calculateProgressPhaseAmount = (totalAmount: number, percentage: number): number => {
  return Math.round((totalAmount * (percentage / 100)) * 100) / 100;
};

export const calculateChangeOrderTotal = (changeOrders: { total: number }[]): number => {
  return Math.round(changeOrders.reduce((sum, co) => sum + co.total, 0) * 100) / 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Markup calculation helpers
export const calculateMarkupAmount = (cost: number, markupPercentage: number): number => {
  return Math.round((cost * (markupPercentage / 100)) * 100) / 100;
};

export const calculateSellingPrice = (cost: number, markupPercentage: number): number => {
  return Math.round((cost * (1 + markupPercentage / 100)) * 100) / 100;
};

export const calculateMarginFromMarkup = (markupPercentage: number): number => {
  return Math.round((markupPercentage / (100 + markupPercentage)) * 100 * 100) / 100;
};

export const calculateMarkupFromMargin = (marginPercentage: number): number => {
  return Math.round((marginPercentage / (100 - marginPercentage)) * 100 * 100) / 100;
};