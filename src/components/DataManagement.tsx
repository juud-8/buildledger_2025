import React, { useState } from 'react';
import { Download, Upload, Copy, Archive, Search, Filter, Printer, FileText, Database, RefreshCw, Trash2, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import { Invoice, Client, ContractorInfo } from '../types';
import {
  getInvoices,
  getClients,
  getContractorInfo,
  saveInvoice,
  saveClient,
  saveContractorInfo,
  deleteInvoice,
  deleteClient
} from '../utils/storage';
import { buildExportBlob } from '../utils/exporter';
import { importFromBlob } from '../utils/importer';
import { formatCurrency, formatDate } from '../utils/calculations';

interface DataManagementProps {
  onClose: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup' | 'archive' | 'search'>('export');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const [archivedItems, setArchivedItems] = useState<Invoice[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Export functionality
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportData = (type: 'all' | 'invoices' | 'clients' | 'settings') => {
    let data: any = {};
    let filename = '';

    switch (type) {
      case 'all': {
        filename = `buildledger-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
        const blob = buildExportBlob();
        downloadBlob(blob, filename);
        return;
      }
      case 'invoices':
        data = {
          invoices: getInvoices(),
          exportDate: new Date().toISOString()
        };
        filename = `buildledger-invoices-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'clients':
        data = {
          clients: getClients(),
          exportDate: new Date().toISOString()
        };
        filename = `buildledger-clients-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'settings':
        data = {
          contractorInfo: getContractorInfo(),
          exportDate: new Date().toISOString()
        };
        filename = `buildledger-settings-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  };

  // Import functionality
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmImport = window.confirm(
      'Importing data will merge with existing records. Continue?'
    );
    if (!confirmImport) return;

    const success = await importFromBlob(file);
    if (success) {
      alert('Data imported successfully!');
      window.location.reload();
    } else {
      alert('Error importing data. Please check the file format.');
    }
  };

  // Duplicate invoice/quote
  const duplicateInvoice = (originalInvoice: Invoice) => {
    const duplicated: Invoice = {
      ...originalInvoice,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      number: generateNextNumber(originalInvoice.type),
      date: new Date(),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      originalQuoteId: undefined,
      convertedInvoiceId: undefined
    };

    saveInvoice(duplicated);
    alert(`${originalInvoice.type.charAt(0).toUpperCase() + originalInvoice.type.slice(1)} duplicated successfully!`);
  };

  const generateNextNumber = (type: 'invoice' | 'quote'): string => {
    const invoices = getInvoices();
    const filtered = invoices.filter(i => i.type === type);
    const numbers = filtered
      .map(i => parseInt(i.number.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const prefix = type === 'invoice' ? 'INV' : 'QUO';
    
    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  };

  // Archive functionality
  const archiveInvoice = (invoice: Invoice) => {
    const archived = { ...invoice, status: 'archived' as const };
    saveInvoice(archived);
    setArchivedItems(prev => [...prev, archived]);
    alert('Invoice archived successfully!');
  };

  const restoreInvoice = (invoice: Invoice) => {
    const restored = { ...invoice, status: 'draft' as const };
    saveInvoice(restored);
    setArchivedItems(prev => prev.filter(item => item.id !== invoice.id));
    alert('Invoice restored successfully!');
  };

  // Advanced search
  const performAdvancedSearch = () => {
    setIsSearching(true);
    const invoices = getInvoices();
    
    let filtered = invoices.filter(invoice => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesText = 
          invoice.number.toLowerCase().includes(searchLower) ||
          invoice.client.name.toLowerCase().includes(searchLower) ||
          invoice.projectTitle.toLowerCase().includes(searchLower) ||
          (invoice.projectDescription && invoice.projectDescription.toLowerCase().includes(searchLower)) ||
          (invoice.notes && invoice.notes.toLowerCase().includes(searchLower));
        
        if (!matchesText) return false;
      }

      // Date range
      if (dateRange.start && invoice.date < new Date(dateRange.start)) return false;
      if (dateRange.end && invoice.date > new Date(dateRange.end)) return false;

      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && invoice.type !== typeFilter) return false;

      // Client filter
      if (clientFilter !== 'all' && invoice.client.id !== clientFilter) return false;

      // Amount range
      if (amountRange.min && invoice.total < parseFloat(amountRange.min)) return false;
      if (amountRange.max && invoice.total > parseFloat(amountRange.max)) return false;

      return true;
    });

    setSearchResults(filtered);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setTypeFilter('all');
    setClientFilter('all');
    setAmountRange({ min: '', max: '' });
    setSearchResults([]);
  };

  // Print functionality
  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${invoice.type.toUpperCase()} ${invoice.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .line-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .line-items th, .line-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .line-items th { background-color: #f5f5f5; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-final { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${invoice.contractorInfo.name}</h1>
            <p>${invoice.contractorInfo.address}, ${invoice.contractorInfo.city}, ${invoice.contractorInfo.state} ${invoice.contractorInfo.zipCode}</p>
            <p>Phone: ${invoice.contractorInfo.phone} | Email: ${invoice.contractorInfo.email}</p>
            <h2>${invoice.type.toUpperCase()} #${invoice.number}</h2>
          </div>
          
          <div class="info-grid">
            <div>
              <h3>Bill To:</h3>
              <p><strong>${invoice.client.name}</strong></p>
              <p>${invoice.client.address}</p>
              <p>${invoice.client.city}, ${invoice.client.state} ${invoice.client.zipCode}</p>
              <p>Phone: ${invoice.client.phone}</p>
              <p>Email: ${invoice.client.email}</p>
            </div>
            <div>
              <h3>Project:</h3>
              <p><strong>${invoice.projectTitle}</strong></p>
              ${invoice.projectDescription ? `<p>${invoice.projectDescription}</p>` : ''}
              ${invoice.projectAddress ? `<p>Location: ${invoice.projectAddress}</p>` : ''}
              <p>Date: ${formatDate(invoice.date)}</p>
              ${invoice.dueDate ? `<p>Due: ${formatDate(invoice.dueDate)}</p>` : ''}
            </div>
          </div>
          
          <table class="line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>${formatCurrency(item.rate)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>${formatCurrency(invoice.total)}</span>
            </div>
          </div>
          
          ${invoice.terms ? `
            <div style="margin-top: 30px;">
              <h3>Terms & Conditions:</h3>
              <p style="white-space: pre-wrap;">${invoice.terms}</p>
            </div>
          ` : ''}
          
          ${invoice.notes ? `
            <div style="margin-top: 20px;">
              <h3>Notes:</h3>
              <p style="white-space: pre-wrap;">${invoice.notes}</p>
            </div>
          ` : ''}
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const clients = getClients();
  const invoices = getInvoices();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">Data Management</h2>
              <p className="text-blue-100 text-sm">Export, import, backup, and manage your data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'export', label: 'Export', icon: Download },
              { id: 'import', label: 'Import', icon: Upload },
              { id: 'backup', label: 'Backup & Restore', icon: RefreshCw },
              { id: 'archive', label: 'Archive', icon: Archive },
              { id: 'search', label: 'Advanced Search', icon: Search }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                <p className="text-gray-600 mb-6">Download your data in JSON format for backup or migration purposes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Database className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Complete Backup</h4>
                  <p className="text-sm text-gray-600 mb-4">All invoices, clients, and settings</p>
                  <button
                    onClick={() => exportData('all')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Export All
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Invoices & Quotes</h4>
                  <p className="text-sm text-gray-600 mb-4">{invoices.length} documents</p>
                  <button
                    onClick={() => exportData('invoices')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export Invoices
                  </button>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <User className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Clients</h4>
                  <p className="text-sm text-gray-600 mb-4">{clients.length} clients</p>
                  <button
                    onClick={() => exportData('clients')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Export Clients
                  </button>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 mb-2">Settings</h4>
                  <p className="text-sm text-gray-600 mb-4">Business configuration</p>
                  <button
                    onClick={() => exportData('settings')}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Export Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h3>
                <p className="text-gray-600 mb-6">Restore data from a previously exported JSON file.</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Important Notice</h4>
                    <p className="text-sm text-yellow-800">
                      Importing data will merge with existing data. Duplicate entries may be created if the same data is imported multiple times.
                      Consider backing up your current data before importing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Select JSON File to Import</h4>
                <p className="text-gray-600 mb-6">Choose a BuildLedger export file to restore your data</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {/* Backup & Restore Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h3>
                <p className="text-gray-600 mb-6">Create automated backups and restore from previous backups.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    Create Backup
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Create a complete backup of all your data including invoices, clients, and settings.
                  </p>
                  <button
                    onClick={() => exportData('all')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Create Full Backup
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    Restore from Backup
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Restore your data from a previously created backup file.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Backup Best Practices</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Create regular backups, especially before major changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Store backup files in a secure location (cloud storage, external drive)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Test restore process periodically to ensure backups are working</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Keep multiple backup versions for different time periods</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Archive Tab */}
          {activeTab === 'archive' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Archive Management</h3>
                <p className="text-gray-600 mb-6">Archive old documents to keep your active list clean while preserving records.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-gray-900">Active Documents</h4>
                    <p className="text-sm text-gray-600">Documents available for editing and processing</p>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {invoices.filter(inv => inv.status !== 'archived').map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invoice.number}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              invoice.type === 'invoice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {invoice.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{invoice.client.name} • {formatCurrency(invoice.total)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => duplicateInvoice(invoice)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => printInvoice(invoice)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Print"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => archiveInvoice(invoice)}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-gray-900">Archived Documents</h4>
                    <p className="text-sm text-gray-600">Documents moved to archive for record keeping</p>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {invoices.filter(inv => inv.status === 'archived').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Archive className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No archived documents</p>
                      </div>
                    ) : (
                      invoices.filter(inv => inv.status === 'archived').map(invoice => (
                        <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600">{invoice.number}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                invoice.type === 'invoice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {invoice.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{invoice.client.name} • {formatCurrency(invoice.total)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => printInvoice(invoice)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Print"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => restoreInvoice(invoice)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Restore"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Search & Filter</h3>
                <p className="text-gray-600 mb-6">Find specific invoices and quotes using advanced search criteria.</p>
              </div>

              {/* Search Filters */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Text</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Invoice number, client name, project..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="invoice">Invoices</option>
                      <option value="quote">Quotes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Clients</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                    <input
                      type="number"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                    <input
                      type="number"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                      placeholder="999999.99"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={performAdvancedSearch}
                    disabled={isSearching}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSearching ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </button>
                  <button
                    onClick={clearSearch}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-gray-900">Search Results ({searchResults.length})</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {searchResults.map(invoice => (
                      <div key={invoice.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">{invoice.number}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                invoice.type === 'invoice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {invoice.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {invoice.client.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(invoice.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {formatCurrency(invoice.total)}
                              </div>
                              <div className="font-medium">{invoice.projectTitle}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => duplicateInvoice(invoice)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => printInvoice(invoice)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Print"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagement;