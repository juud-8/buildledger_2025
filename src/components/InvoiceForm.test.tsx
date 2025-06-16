import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InvoiceForm from './InvoiceForm';
import type { Client, ContractorInfo, Invoice, LineItem, TaxBreakdown } from '../types';



jest.mock('../utils/storage', () => ({
  getClients: jest.fn(),
  getContractorInfo: jest.fn(),
  generateNextNumber: jest.fn(),
  saveInvoice: jest.fn(),
  getInvoiceById: jest.fn(),
  convertQuoteToInvoice: jest.fn(),
  updateExpiredQuotes: jest.fn(),
  getTemplateSettings: jest.fn()
}));

import * as storage from '../utils/storage';

describe('InvoiceForm', () => {
  const mockClient: Client = {
    id: '1',
    name: 'Client One',
    address: '123 St',
    city: 'Town',
    state: 'TX',
    zipCode: '75001',
    phone: '123',
    email: 'c1@test.com',
    createdAt: new Date()
  };

  const mockContractor: ContractorInfo = {
    name: 'My Biz',
    address: '456 St',
    city: 'Town',
    state: 'TX',
    zipCode: '75002',
    phone: '321',
    email: 'biz@test.com',
    licenseNumber: 'LIC-1'
  };

  const mockTemplateSettings = {
  id: 'modern',
  name: 'Modern',
  type: 'modern' as 'modern',
  colorScheme: {
    primary: '#000',
    secondary: '#000',
    accent: '#000',
    text: '#000',
    background: '#fff',
    border: '#000'
  },
  headerStyle: 'standard' as const,
  footerStyle: 'standard' as const,
  showLogo: true,
  showProjectPhotos: false,
  showDetailedBreakdown: true,
  fontFamily: 'Arial' as 'Arial',
  fontSize: 'medium' as 'medium',
  showDigitalSignature: false // ✅ include this or TypeScript will complain
};

  const lineItem: LineItem = {
    id: 'l1',
    description: 'Item',
    category: 'material',
    quantity: 1,
    unit: 'ea',
    rate: 10,
    total: 10
  };

  const taxBreakdown: TaxBreakdown = {
    materialTax: 0.8,
    laborTax: 0,
    equipmentTax: 0,
    otherTax: 0,
    totalTax: 0.8
  };

  const invoice: Invoice = {
    id: 'i1',
    type: 'invoice',
    number: 'INV-0001',
    date: new Date(),
    dueDate: new Date(),
    contractorInfo: mockContractor,
    client: mockClient,
    projectTitle: 'Test Project',
    lineItems: [lineItem],
    subtotal: 10,
    materialSubtotal: 10,
    laborSubtotal: 0,
    equipmentSubtotal: 0,
    otherSubtotal: 0,
    taxBreakdown,
    taxAmount: 0.8,
    discounts: [],
    discountAmount: 0,
    total: 10.8,
    depositAmount: 0,
    payments: [],
    balanceDue: 10.8,
    changeOrders: [],
    changeOrderTotal: 0,
    progressBilling: [],
    isProgressBilling: false,
    templateSettings: mockTemplateSettings,
    terms: '',
    notes: '',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    (storage.getClients as jest.Mock).mockReturnValue([mockClient]);
    (storage.getContractorInfo as jest.Mock).mockReturnValue(mockContractor);
    (storage.generateNextNumber as jest.Mock).mockReturnValue('INV-0001');
    (storage.getTemplateSettings as jest.Mock).mockReturnValue(mockTemplateSettings);
  });

  test('submits and calls onSave', () => {
    const onSave = jest.fn();
    render(<InvoiceForm editingInvoice={invoice} onInvoiceUpdated={onSave} />);
    const button = screen.getByRole('button', { name: /update invoice/i });
    fireEvent.click(button);
    expect(onSave).toHaveBeenCalled();
    expect(storage.saveInvoice).toHaveBeenCalled();
  });
});
