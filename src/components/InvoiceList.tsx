import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Eye, Download, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, User, Database, Copy, Printer, Archive } from 'lucide-react';
import { Invoice } from '../types';
import { getInvoices, deleteInvoice, updateInvoiceStatus, convertQuoteToInvoice, updateExpiredQuotes, saveInvoice, generateNextNumber } from '../utils/storage';
import { formatDate, formatCurrency } from '../utils/calculations';
import DataManagement from './DataManagement';
import AddPaymentModal from './AddPaymentModal';

interface InvoiceListProps {
  onEditInvoice: (invoice: Invoice) => void;
  onCreateNew: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onEditInvoice, onCreateNew }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'quote'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Invoice['status']>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [convertingQuote, setConvertingQuote] = useState<string | null>(null);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, filterType, filterStatus]);

  const loadInvoices = () => {
    updateExpiredQuotes(); // Update expired quotes before loading
    const loadedInvoices = getInvoices().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setInvoices(loadedInvoices);
  };

  const filterInvoices = () => {
    let filtered = invoices;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(invoice => invoice.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }

    setFilteredInvoices(filtered);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    deleteInvoice(invoiceId);
    loadInvoices();
    setDeleteConfirm(null);
  };

  const handleStatusChange = (invoiceId: string, status: Invoice['status']) => {
    updateInvoiceStatus(invoiceId, status);
    loadInvoices();
  };

  const handleConvertQuote = async (quoteId: string) => {
    setConvertingQuote(quoteId);
    try {
      const newInvoice = convertQuoteToInvoice(quoteId);
      if (newInvoice) {
        loadInvoices();
        alert('Quote converted to invoice successfully!');
      }
    } catch (error) {
      alert('Error converting quote: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setConvertingQuote(null);
    }
  };

  const handleDuplicateInvoice = (originalInvoice: Invoice) => {
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
    loadInvoices();
    alert(`${originalInvoice.type.charAt(0).toUpperCase() + originalInvoice.type.slice(1)} duplicated successfully!`);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print ${invoice.type.toUpperCase()} ${invoice.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .document-title { font-size: 20px; font-weight: bold; color: #2563eb; margin-top: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .info-section h3 { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #374151; }
            .line-items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .line-items th, .line-items td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
            .line-items th { background-color: #f8f9fa; font-weight: bold; }
            .line-items .amount { text-align: right; }
            .totals { margin-left: auto; width: 350px; border: 1px solid #ddd; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #eee; }
            .total-final { font-weight: bold; font-size: 18px; background-color: #f8f9fa; border-top: 2px solid #333; }
            .terms, .notes { margin-top: 30px; }
            .terms h3, .notes h3 { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #374151; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { 
              body { margin: 0; } 
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${invoice.contractorInfo.name}</div>
            <div>${invoice.contractorInfo.address}</div>
            <div>${invoice.contractorInfo.city}, ${invoice.contractorInfo.state} ${invoice.contractorInfo.zipCode}</div>
            <div>Phone: ${invoice.contractorInfo.phone} | Email: ${invoice.contractorInfo.email}</div>
            ${invoice.contractorInfo.website ? `<div>Website: ${invoice.contractorInfo.website}</div>` : ''}
            <div class="document-title">${invoice.type.toUpperCase()} #${invoice.number}</div>
          </div>
          
          <div class="info-grid">
            <div class="info-section">
              <h3>Bill To:</h3>
              <div><strong>${invoice.client.name}</strong></div>
              ${invoice.client.contactPerson ? `<div>Attn: ${invoice.client.contactPerson}</div>` : ''}
              <div>${invoice.client.address}</div>
              <div>${invoice.client.city}, ${invoice.client.state} ${invoice.client.zipCode}</div>
              <div>Phone: ${invoice.client.phone}</div>
              <div>Email: ${invoice.client.email}</div>
            </div>
            <div class="info-section">
              <h3>Document Details:</h3>
              <div><strong>Date:</strong> ${formatDate(invoice.date)}</div>
              ${invoice.dueDate ? `<div><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</div>` : ''}
              ${invoice.expiryDate ? `<div><strong>Expires:</strong> ${formatDate(invoice.expiryDate)}</div>` : ''}
              <div><strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</div>
              <br>
              <h3>Project:</h3>
              <div><strong>${invoice.projectTitle}</strong></div>
              ${invoice.projectDescription ? `<div>${invoice.projectDescription}</div>` : ''}
              ${invoice.projectAddress ? `<div><strong>Location:</strong> ${invoice.projectAddress}</div>` : ''}
            </div>
          </div>
          
          <table class="line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-transform: capitalize;">${item.category.replace(/([A-Z])/g, ' $1').trim()}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td class="amount">${formatCurrency(item.rate)}</td>
                  <td class="amount"><strong>${formatCurrency(item.total)}</strong></td>
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
            ${invoice.discountAmount > 0 ? `
              <div class="total-row" style="color: #dc2626;">
                <span>Discount:</span>
                <span>-${formatCurrency(invoice.discountAmount)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>TOTAL:</span>
              <span>${formatCurrency(invoice.total)}</span>
            </div>
          </div>
          
          ${invoice.terms ? `
            <div class="terms">
              <h3>Terms & Conditions:</h3>
              <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${invoice.terms}</div>
            </div>
          ` : ''}
          
          ${invoice.notes ? `
            <div class="notes">
              <h3>Notes:</h3>
              <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${invoice.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <div><strong>License #:</strong> ${invoice.contractorInfo.licenseNumber}</div>
            ${invoice.contractorInfo.taxId ? `<div><strong>Tax ID:</strong> ${invoice.contractorInfo.taxId}</div>` : ''}
            ${invoice.contractorInfo.insuranceProvider ? `<div><strong>Insurance:</strong> ${invoice.contractorInfo.insuranceProvider}</div>` : ''}
            <div style="margin-top: 15px;">Thank you for your business!</div>
            <div>This ${invoice.type} was generated on ${formatDate(new Date())}</div>
          </div>
          
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

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'converted': return <RefreshCw className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: 'invoice' | 'quote') => {
    return type === 'invoice' 
      ? 'bg-blue-50 text-blue-700 border-blue-200' 
      : 'bg-green-50 text-green-700 border-green-200';
  };

  const isQuoteExpired = (invoice: Invoice) => {
    return invoice.type === 'quote' && 
           invoice.expiryDate && 
           invoice.expiryDate < new Date() && 
           invoice.status !== 'converted';
  };

  const canConvertQuote = (invoice: Invoice) => {
    return invoice.type === 'quote' && 
           invoice.status !== 'converted' && 
           invoice.status !== 'rejected' &&
           !isQuoteExpired(invoice);
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoice(prev => (prev === id ? null : id));
  };

  const handlePaymentAdded = () => {
    loadInvoices();
  };

  const statusOptions: Invoice['status'][] = [
    'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted', 'paid', 'overdue'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices & Quotes</h1>
              <p className="text-gray-600">Manage your invoices, quotes, and track their status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDataManagement(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Data Management
            </button>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number, client, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'invoice' | 'quote')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoices</option>
              <option value="quote">Quotes</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | Invoice['status'])}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Total: {invoices.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span>Showing: {filteredInvoices.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            <span>Total Value: {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.total, 0))}</span>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          {invoices.length === 0 ? (
            <>
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first invoice or quote</p>
              <button
                onClick={onCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Create Your First Document
              </button>
            </>
          ) : (
            <>
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(invoice.type)}`}>
                      {invoice.type.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{invoice.number}</h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </div>
                        {isQuoteExpired(invoice) && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3" />
                            Expired
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{invoice.projectTitle}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {invoice.client.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(invoice.date)}
                        </div>
                        {invoice.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {formatDate(invoice.dueDate)}
                          </div>
                        )}
                        {invoice.expiryDate && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Expires: {formatDate(invoice.expiryDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-semibold text-gray-900 mb-2">
                      <DollarSign className="h-5 w-5" />
                      {formatCurrency(invoice.total)}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Status Change Dropdown */}
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      
                      {/* Action Buttons */}
                      <button
                        onClick={() => onEditInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDuplicateInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      {invoice.balanceDue > 0 && (
                        <button
                          onClick={() => setPaymentModalInvoice(invoice)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Add Payment"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canConvertQuote(invoice) && (
                        <button
                          onClick={() => handleConvertQuote(invoice.id)}
                          disabled={convertingQuote === invoice.id}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Convert to Invoice"
                        >
                          {convertingQuote === invoice.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setDeleteConfirm(invoice.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span>Created: {formatDate(invoice.createdAt)}</span>
                    {invoice.updatedAt.getTime() !== invoice.createdAt.getTime() && (
                      <span>Updated: {formatDate(invoice.updatedAt)}</span>
                    )}
                    {invoice.originalQuoteId && (
                      <span className="text-purple-600">Converted from Quote</span>
                    )}
                    {invoice.convertedInvoiceId && (
                      <span className="text-green-600">Converted to Invoice</span>
                    )}
                  </div>
                <div className="text-xs">
                  {invoice.lineItems.length} item{invoice.lineItems.length !== 1 ? 's' : ''}
                </div>
              </div>

              {expandedInvoice === invoice.id && (
                <div className="mt-4 bg-gray-50 border rounded-lg p-4 text-sm space-y-2">
                  <h4 className="font-medium">Payment History</h4>
                  {invoice.payments.length === 0 ? (
                    <p className="text-gray-600">No payments recorded</p>
                  ) : (
                    <ul className="space-y-1">
                      {invoice.payments.map(p => (
                        <li key={p.id} className="flex justify-between">
                          <span>{formatDate(p.date)}</span>
                          <span>{formatCurrency(p.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setPaymentModalInvoice(invoice)}
                        className="mt-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Add Payment
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => toggleExpand(invoice.id)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {expandedInvoice === invoice.id ? 'Hide Details' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this document? All associated data will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInvoice(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentModalInvoice && (
        <AddPaymentModal
          invoice={paymentModalInvoice}
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      {/* Data Management Modal */}
      {showDataManagement && (
        <DataManagement onClose={() => setShowDataManagement(false)} />
      )}
    </div>
  );
};

export default InvoiceList;