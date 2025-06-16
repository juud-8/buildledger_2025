import { Client, Invoice, ContractorInfo, TemplateSettings } from '../types';
import { getNextInvoiceNumber } from './identifier';

const STORAGE_KEYS = {
  CLIENTS: 'buildledger_clients',
  INVOICES: 'buildledger_invoices',
  CONTRACTOR_INFO: 'buildledger_contractor_info',
  TEMPLATE_SETTINGS: 'buildledger_template_settings',
  SETTINGS: 'buildledger_settings'
};

// Client Management
export const saveClient = (client: Client): void => {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getClients = (): Client[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  if (!stored) return [];
  
  try {
    const clients = JSON.parse(stored) as Client[];
    return clients.map(client => ({
      ...client,
      createdAt: new Date(client.createdAt)
    }));
  } catch {
    return [];
  }
};

export const deleteClient = (clientId: string): void => {
  const clients = getClients().filter(c => c.id !== clientId);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

// Invoice Management
export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date() };
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const getInvoices = (): Invoice[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (!stored) return [];
  
  try {
    const invoices = JSON.parse(stored) as Invoice[];
    return invoices.map(invoice => ({
      ...invoice,
      date: new Date(invoice.date),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      expiryDate: invoice.expiryDate ? new Date(invoice.expiryDate) : undefined,
      createdAt: new Date(invoice.createdAt),
      updatedAt: new Date(invoice.updatedAt),
      client: {
        ...invoice.client,
        createdAt: new Date(invoice.client.createdAt)
      },
      payments: invoice.payments ? invoice.payments.map(payment => ({
        ...payment,
        date: new Date(payment.date)
      })) : [],
      changeOrders: invoice.changeOrders ? invoice.changeOrders.map(co => ({
        ...co,
        date: new Date(co.date),
        approvedDate: co.approvedDate ? new Date(co.approvedDate) : undefined
      })) : [],
      progressBilling: invoice.progressBilling ? invoice.progressBilling.map(pb => ({
        ...pb,
        dueDate: pb.dueDate ? new Date(pb.dueDate) : undefined,
        billedDate: pb.billedDate ? new Date(pb.billedDate) : undefined,
        paidDate: pb.paidDate ? new Date(pb.paidDate) : undefined
      })) : []
    }));
  } catch {
    return [];
  }
};

export const deleteInvoice = (invoiceId: string): void => {
  const invoices = getInvoices().filter(i => i.id !== invoiceId);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const getInvoiceById = (id: string): Invoice | null => {
  const invoices = getInvoices();
  return invoices.find(i => i.id === id) || null;
};

export const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']): void => {
  const invoices = getInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (invoice) {
    invoice.status = status;
    invoice.updatedAt = new Date();
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }
};

// Quote to Invoice Conversion
export const convertQuoteToInvoice = (quoteId: string): Invoice | null => {
  const quote = getInvoiceById(quoteId);
  if (!quote || quote.type !== 'quote') {
    return null;
  }

  // Create new invoice from quote
  const invoiceNumber = getNextInvoiceNumber(getInvoices());
  const currentDate = new Date();
  const dueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const invoice: Invoice = {
    ...quote,
    id: generateUniqueId(),
    type: 'invoice',
    number: invoiceNumber,
    date: currentDate,
    dueDate: dueDate,
    expiryDate: undefined, // Invoices don't have expiry dates
    status: 'draft',
    originalQuoteId: quote.id,
    createdAt: currentDate,
    updatedAt: currentDate
  };

  // Update original quote status and link to invoice
  const updatedQuote = {
    ...quote,
    status: 'converted' as const,
    convertedInvoiceId: invoice.id,
    updatedAt: currentDate
  };

  // Save both documents
  saveInvoice(invoice);
  saveInvoice(updatedQuote);

  return invoice;
};

// Check for expired quotes
export const updateExpiredQuotes = (): void => {
  const invoices = getInvoices();
  const currentDate = new Date();
  let hasUpdates = false;

  invoices.forEach(invoice => {
    if (
      invoice.type === 'quote' && 
      invoice.status === 'sent' && 
      invoice.expiryDate && 
      invoice.expiryDate < currentDate
    ) {
      invoice.status = 'expired';
      invoice.updatedAt = new Date();
      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }
};

// Contractor Info Management
export const saveContractorInfo = (info: ContractorInfo): void => {
  localStorage.setItem(STORAGE_KEYS.CONTRACTOR_INFO, JSON.stringify(info));
};

export const getContractorInfo = (): ContractorInfo | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONTRACTOR_INFO);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Template Settings Management
export const saveTemplateSettings = (settings: TemplateSettings): void => {
  localStorage.setItem(STORAGE_KEYS.TEMPLATE_SETTINGS, JSON.stringify(settings));
};

export const getTemplateSettings = (): TemplateSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATE_SETTINGS);
  if (!stored) {
    return getDefaultTemplateSettings();
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultTemplateSettings();
  }
};

export const getDefaultTemplateSettings = (): TemplateSettings => {
  return {
    id: 'modern',
    name: 'Modern',
    type: 'modern',
    colorScheme: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      text: '#1f2937',
      background: '#ffffff',
      border: '#e5e7eb'
    },
    headerStyle: 'standard',
    footerStyle: 'standard',
    showLogo: true,
    showProjectPhotos: false,
    showDetailedBreakdown: true,
    fontFamily: 'Arial',
    fontSize: 'medium'
  };
};

// Generate next invoice/quote number

// Generate unique ID
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Data Export/Import utilities
export const exportAllData = () => {
  return {
    invoices: getInvoices(),
    clients: getClients(),
    contractorInfo: getContractorInfo(),
    templateSettings: getTemplateSettings(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
};

export const importData = (data: unknown) => {
  try {
    const record = data as Record<string, unknown>;
    if (Array.isArray((record as any).invoices)) {
      (record as any).invoices.forEach((invoice: any) => {
        const convertedInvoice = {
          ...invoice,
          date: new Date(invoice.date),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
          expiryDate: invoice.expiryDate ? new Date(invoice.expiryDate) : undefined,
          createdAt: new Date(invoice.createdAt),
          updatedAt: new Date(invoice.updatedAt),
          client: {
            ...invoice.client,
            createdAt: new Date(invoice.client.createdAt)
          }
        };
        saveInvoice(convertedInvoice);
      });
    }

    if (Array.isArray((record as any).clients)) {
      (record as any).clients.forEach((client: any) => {
        const convertedClient = {
          ...client,
          createdAt: new Date(client.createdAt)
        };
        saveClient(convertedClient);
      });
    }

    if ((record as any).contractorInfo) {
      saveContractorInfo((record as any).contractorInfo);
    }

    if ((record as any).templateSettings) {
      saveTemplateSettings((record as any).templateSettings);
    }

    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
};

// Archive functionality
export const archiveInvoice = (invoiceId: string): void => {
  updateInvoiceStatus(invoiceId, 'archived');
};

export const restoreInvoice = (invoiceId: string): void => {
  updateInvoiceStatus(invoiceId, 'draft');
};

// Search functionality
export interface SearchFilters {
  searchTerm?: string;
  dateRange?: { start?: string; end?: string };
  statusFilter?: string;
  typeFilter?: string;
  clientFilter?: string;
  amountRange?: { min?: string; max?: string };
}

export const searchInvoices = (filters: SearchFilters): Invoice[] => {
  const invoices = getInvoices();
  
  return invoices.filter(invoice => {
    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesText = 
        invoice.number.toLowerCase().includes(searchLower) ||
        invoice.client.name.toLowerCase().includes(searchLower) ||
        invoice.projectTitle.toLowerCase().includes(searchLower) ||
        (invoice.projectDescription && invoice.projectDescription.toLowerCase().includes(searchLower)) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(searchLower));
      
      if (!matchesText) return false;
    }

    // Date range
    if (filters.dateRange?.start && invoice.date < new Date(filters.dateRange.start)) return false;
    if (filters.dateRange?.end && invoice.date > new Date(filters.dateRange.end)) return false;

    // Status filter
    if (filters.statusFilter && filters.statusFilter !== 'all' && invoice.status !== filters.statusFilter) return false;

    // Type filter
    if (filters.typeFilter && filters.typeFilter !== 'all' && invoice.type !== filters.typeFilter) return false;

    // Client filter
    if (filters.clientFilter && filters.clientFilter !== 'all' && invoice.client.id !== filters.clientFilter) return false;

    // Amount range
    if (filters.amountRange?.min && invoice.total < parseFloat(filters.amountRange.min)) return false;
    if (filters.amountRange?.max && invoice.total > parseFloat(filters.amountRange.max)) return false;

    return true;
  });
};