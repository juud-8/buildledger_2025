import { getNextInvoiceNumber, getNextQuoteNumber } from '../src/utils/identifier';
import { Invoice } from '../src/types';

describe('identifier utilities', () => {
  test('generates next invoice number with padding', () => {
    const invoices: Invoice[] = [
      { id: '1', type: 'invoice', number: 'INV-0001', date: new Date(), contractorInfo: {} as any, client: {} as any, projectTitle: '', lineItems: [], subtotal:0, materialSubtotal:0, laborSubtotal:0, equipmentSubtotal:0, otherSubtotal:0, taxBreakdown: {materialTax:0,laborTax:0,equipmentTax:0,otherTax:0,totalTax:0}, taxAmount:0, discounts: [], discountAmount:0, total:0, payments: [], balanceDue:0, changeOrders: [], changeOrderTotal:0, isProgressBilling:false, status:'draft', createdAt:new Date(), updatedAt:new Date() }
    ];
    expect(getNextInvoiceNumber(invoices)).toBe('INV-0002');
  });

  test('generates next quote number when none exist', () => {
    const invoices: Invoice[] = [];
    expect(getNextQuoteNumber(invoices)).toBe('QUO-0001');
  });
});
