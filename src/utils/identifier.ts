import { Invoice } from '../types';

export const getNextInvoiceNumber = (invoices: Invoice[]): string => {
  const numbers = invoices
    .filter(i => i.type === 'invoice')
    .map(i => parseInt(i.number.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `INV-${next.toString().padStart(4, '0')}`;
};

export const getNextQuoteNumber = (quotes: Invoice[]): string => {
  const numbers = quotes
    .filter(q => q.type === 'quote')
    .map(q => parseInt(q.number.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `QUO-${next.toString().padStart(4, '0')}`;
};
