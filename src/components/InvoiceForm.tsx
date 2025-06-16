import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from './ui/Toast';
import { FileText, Calendar, User, Building2, MapPin, Save, Download, Eye, RefreshCw, Clock, Palette } from 'lucide-react';
import { InvoiceFormData, Client, ContractorInfo, LineItem, Invoice, ProjectPhoto } from '../types';
import { getClients, getContractorInfo, saveInvoice, getInvoiceById, convertQuoteToInvoice, updateExpiredQuotes, getTemplateSettings, getInvoices } from '../utils/storage';
import { getNextInvoiceNumber, getNextQuoteNumber } from '../utils/identifier';
import { useCreateInvoice, useUpdateInvoice } from '../hooks/useInvoices';
import { calculateSubtotal, calculateTaxBreakdown, calculateDiscountAmount, calculateBalanceDue, formatCurrency, getCategoryTotals } from '../utils/calculations';

import { v4 as uuidv4 } from 'uuid';
import LineItemsForm from './LineItemsForm';
import ClientForm from './ClientForm';
import ContractorSetupModal from './ContractorSetupModal';
import ClientSelector from './ClientSelector';
import PDFExportModal from './PDFExportModal';
import AdvancedCalculationsPanel from './AdvancedCalculationsPanel';
import ProjectPhotoManager from './ProjectPhotoManager';
import TemplateSelector from './TemplateSelector';

interface InvoiceFormProps {
  editingInvoice?: Invoice | null;
  onInvoiceUpdated?: () => void;
}

const invoiceSchema = z.object({
  clientId: z.string().uuid({ message: 'Please select a client' }).nonempty(),
  projectTitle: z.string().min(3, 'Project title must be at least 3 characters'),
  lineItems: z.array(z.unknown()).min(1, 'Add at least one line item')
});
type InvoiceSchema = z.infer<typeof invoiceSchema>;

const InvoiceForm: React.FC<InvoiceFormProps> = ({ editingInvoice, onInvoiceUpdated }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contractorInfo, setContractorInfo] = useState<ContractorInfo | null>(null);
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const [showClientForm, setShowClientForm] = useState(false);
  const [showContractorForm, setShowContractorForm] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isConverting, setIsConverting] = useState(false);
const {
  register,
  setValue,
  trigger,
  setFocus,
  formState: { errors }
} = useForm<InvoiceSchema>({
  resolver: zodResolver(invoiceSchema),
  defaultValues: {
    clientId: '',
    projectTitle: '',
    lineItems: []
  }
});

const toast = useToast();
  const [formData, setFormData] = useState<InvoiceFormData>({
    type: 'invoice',
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractorInfo: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      licenseNumber: '',
      website: ''
    },
    clientId: '',
    projectTitle: '',
    projectDescription: '',
    projectAddress: '',
    projectPhotos: [],
    lineItems: [],
    materialTaxRate: 8.25,
    laborTaxRate: 0,
    equipmentTaxRate: 8.25,
    otherTaxRate: 8.25,
    discounts: [],
    depositAmount: 0,
    depositPercentage: 0,
    isProgressBilling: false,
    progressPhases: [],
    templateSettings: getTemplateSettings(),
    terms: '',
    notes: ''
  });

  useEffect(() => {
    setValue('clientId', formData.clientId);
    setValue('projectTitle', formData.projectTitle);
    setValue('lineItems', formData.lineItems);
  }, [formData.clientId, formData.projectTitle, formData.lineItems, setValue]);

  useEffect(() => {
    // Update expired quotes on component mount
    updateExpiredQuotes();
    
    // Load initial data
    loadClients();
    const info = getContractorInfo();
    if (info) {
      setContractorInfo(info);
      setFormData(prev => ({ 
        ...prev, 
        contractorInfo: info,
        materialTaxRate: info.defaultMaterialTaxRate || 8.25,
        laborTaxRate: info.defaultLaborTaxRate || 0,
        equipmentTaxRate: info.defaultEquipmentTaxRate || 8.25,
        terms: info.defaultPaymentTerms ? 
          `Payment Terms: ${info.defaultPaymentTerms}. Payment is due within the specified terms. Late payments may be subject to a 1.5% monthly service charge.` :
          'Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        terms: 'Payment is due within 30 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.'
      }));
    }
    
    // Load editing invoice or generate new number
    if (editingInvoice) {
      loadInvoiceForEditing(editingInvoice);
    } else {
      setFormData(prev => ({
        ...prev,
        number:
          prev.type === 'invoice'
            ? getNextInvoiceNumber(getInvoices())
            : getNextQuoteNumber(getInvoices())
      }));
    }
  }, [editingInvoice]);

  const loadInvoiceForEditing = (invoice: Invoice) => {
    setFormData({
      type: invoice.type,
      number: invoice.number,
      date: invoice.date.toISOString().split('T')[0],
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : '',
      expiryDate: invoice.expiryDate ? invoice.expiryDate.toISOString().split('T')[0] : '',
      contractorInfo: invoice.contractorInfo,
      clientId: invoice.client.id,
      projectTitle: invoice.projectTitle,
      projectDescription: invoice.projectDescription || '',
      projectAddress: invoice.projectAddress || '',
      projectPhotos: invoice.projectPhotos || [],
      lineItems: invoice.lineItems,
      materialTaxRate: invoice.taxBreakdown?.materialTax ? 8.25 : 0,
      laborTaxRate: invoice.taxBreakdown?.laborTax ? 0 : 0,
      equipmentTaxRate: invoice.taxBreakdown?.equipmentTax ? 8.25 : 0,
      otherTaxRate: invoice.taxBreakdown?.otherTax ? 8.25 : 0,
      discounts: invoice.discounts || [],
      depositAmount: invoice.depositAmount || 0,
      depositPercentage: invoice.depositAmount && invoice.total ? (invoice.depositAmount / invoice.total) * 100 : 0,
      isProgressBilling: invoice.isProgressBilling || false,
      progressPhases: invoice.progressBilling || [],
      templateSettings: invoice.templateSettings || getTemplateSettings(),
      terms: invoice.terms || '',
      notes: invoice.notes || ''
    });
    setCurrentInvoice(invoice);
  };

  const loadClients = () => {
    setClients(getClients());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: 'invoice' | 'quote') => {
    if (!editingInvoice) {
      setFormData(prev => ({
        ...prev,
        type,
        number:
          type === 'invoice'
            ? getNextInvoiceNumber(getInvoices())
            : getNextQuoteNumber(getInvoices())
      }));
    }
  };

  const handleLineItemsUpdate = (lineItems: LineItem[]) => {
    setFormData(prev => ({ ...prev, lineItems }));
    setValue('lineItems', lineItems);
  };

  const handleProjectPhotosUpdate = (photos: ProjectPhoto[]) => {
    setFormData(prev => ({ ...prev, projectPhotos: photos }));
  };

  const handleClientSelect = (clientId: string) => {
    setFormData(prev => ({ ...prev, clientId }));
    setValue('clientId', clientId);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const handleClientSave = (client: Client) => {
    loadClients(); // Reload clients to get the updated list
    setFormData(prev => ({ ...prev, clientId: client.id }));
    setValue('clientId', client.id);
  };

  const handleContractorInfoSave = (info: ContractorInfo) => {
    setContractorInfo(info);
    setFormData(prev => ({ 
      ...prev, 
      contractorInfo: info,
      materialTaxRate: info.defaultMaterialTaxRate || prev.materialTaxRate,
      laborTaxRate: info.defaultLaborTaxRate || prev.laborTaxRate,
      equipmentTaxRate: info.defaultEquipmentTaxRate || prev.equipmentTaxRate,
      terms: info.defaultPaymentTerms ? 
        `Payment Terms: ${info.defaultPaymentTerms}. Payment is due within the specified terms. Late payments may be subject to a 1.5% monthly service charge.` :
        prev.terms
    }));
  };

  const handleTemplateChange = (template: TemplateSettings) => {
    setFormData(prev => ({ ...prev, templateSettings: template }));
  };

  const handleTaxRateChange = (category: string, rate: number) => {
    setFormData(prev => ({
      ...prev,
      [`${category}TaxRate`]: rate
    }));
  };

  const handleDiscountsChange = (discounts: Discount[]) => {
    setFormData(prev => ({ ...prev, discounts }));
  };

  const handleDepositChange = (percentage: number) => {
    const { total } = calculateTotals();
    setFormData(prev => ({
      ...prev,
      depositPercentage: percentage,
      depositAmount: (total * percentage) / 100
    }));
  };

  const getSelectedClient = (): Client | undefined => {
    return clients.find(c => c.id === formData.clientId);
  };

  const calculateTotals = () => {
    const { material, labor, equipment, other } = getCategoryTotals(formData.lineItems);
    const subtotal = material + labor + equipment + other;
    const taxBreakdown = calculateTaxBreakdown(
      formData.lineItems,
      formData.materialTaxRate,
      formData.laborTaxRate,
      formData.equipmentTaxRate,
      formData.otherTaxRate
    );
    const discountAmount = calculateDiscountAmount(subtotal, subtotal + taxBreakdown.totalTax, formData.discounts, formData.lineItems);
    const total = subtotal + taxBreakdown.totalTax - discountAmount;
    const balanceDue = calculateBalanceDue(total, []);
    
    return {
      subtotal,
      taxBreakdown,
      discountAmount,
      total,
      balanceDue,
      materialSubtotal: material,
      laborSubtotal: labor,
      equipmentSubtotal: equipment,
      otherSubtotal: other
    };
  };

  const createInvoiceObject = (): Invoice => {
    const selectedClient = getSelectedClient();
    if (!selectedClient) {
      throw new Error('No client selected');
    }

    const { subtotal, taxBreakdown, discountAmount, total, balanceDue, materialSubtotal, laborSubtotal, equipmentSubtotal, otherSubtotal } = calculateTotals();
    
    return {
      id: editingInvoice?.id || uuidv4(),
      type: formData.type,
      number: formData.number,
      date: new Date(formData.date),
      dueDate: formData.type === 'invoice' && formData.dueDate ? new Date(formData.dueDate) : undefined,
      expiryDate: formData.type === 'quote' && formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      contractorInfo: formData.contractorInfo,
      client: selectedClient,
      projectTitle: formData.projectTitle,
      projectDescription: formData.projectDescription || undefined,
      projectAddress: formData.projectAddress || undefined,
      projectPhotos: formData.projectPhotos,
      lineItems: formData.lineItems,
      
      // Calculations
      subtotal,
      materialSubtotal,
      laborSubtotal,
      equipmentSubtotal,
      otherSubtotal,
      taxBreakdown,
      taxAmount: taxBreakdown.totalTax,
      discounts: formData.discounts,
      discountAmount,
      total,
      
      // Payment tracking
      depositAmount: formData.depositAmount,
      depositPaid: false,
      payments: [],
      balanceDue,
      
      // Change orders and progress billing
      changeOrders: [],
      changeOrderTotal: 0,
      progressBilling: formData.progressPhases,
      isProgressBilling: formData.isProgressBilling,
      
      // Template settings
      templateSettings: formData.templateSettings,
      
      terms: formData.terms || undefined,
      notes: formData.notes || undefined,
      status: editingInvoice?.status || 'draft',
      originalQuoteId: editingInvoice?.originalQuoteId,
      convertedInvoiceId: editingInvoice?.convertedInvoiceId,
      createdAt: editingInvoice?.createdAt || new Date(),
      updatedAt: new Date()
    };
  };

const handleSave = async () => {
  const valid = await trigger();
  if (!valid) {
    const firstError = Object.keys(errors)[0] as keyof InvoiceSchema;
    if (firstError) {
      setFocus(firstError);
      toast({
        message: `Please correct the field: ${firstError}`,
        variant: 'error'
      });
    }
    return;
  }

  const selectedClient = getSelectedClient();
  if (!selectedClient) {
    toast({ message: 'Please select a client', variant: 'error' });
    return;
  }

  if (!formData.projectTitle.trim()) {
    toast({ message: 'Please enter a project title', variant: 'error' });
    return;
  }

  if (formData.lineItems.length === 0) {
    toast({ message: 'Please add at least one line item', variant: 'error' });
    return;
  }

    try {
      const invoice = createInvoiceObject();
const mutation = editingInvoice ? updateMutation : createMutation;

mutation.mutate(invoice, {
  onSuccess: () => {
    setCurrentInvoice(invoice);

    const action = editingInvoice ? 'updated' : 'saved';
    toast({
      message: `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} ${action} successfully!`,
      variant: 'success'
    });

    if (onInvoiceUpdated) {
      onInvoiceUpdated();
    }

    if (!editingInvoice) {
      setFormData(prev => ({
        ...prev,
        number:
          formData.type === 'invoice'
            ? getNextInvoiceNumber(getInvoices())
            : getNextQuoteNumber(getInvoices()),
        clientId: '',
        projectTitle: '',
        projectDescription: '',
        projectAddress: '',
        projectPhotos: [],
        lineItems: [],
        discounts: [],
        notes: ''
      }));
    }
  },
  onError: (error: unknown) => {
    toast({
      message:
        'Error saving invoice: ' +
        (error instanceof Error ? error.message : 'Unknown error'),
      variant: 'error'
    });
  }
});

    } catch (error) {
      toast({
        message: 'Error saving invoice: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'error'
      });
    }
  };

  const handleConvertToInvoice = async () => {
    if (!editingInvoice || editingInvoice.type !== 'quote') {
      return;
    }

    setIsConverting(true);
    try {
      const newInvoice = convertQuoteToInvoice(editingInvoice.id);
      if (newInvoice && onInvoiceUpdated) {
        toast({ message: 'Quote converted to invoice successfully!', variant: 'success' });
        onInvoiceUpdated();
        // Load the new invoice for editing
        loadInvoiceForEditing(newInvoice);
      }
    } catch (error) {
      toast({
        message: 'Error converting quote: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'error'
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleExportPDF = () => {
    const selectedClient = getSelectedClient();
    if (!selectedClient) {
      toast({ message: 'Please select a client', variant: 'error' });
      return;
    }

    if (!formData.projectTitle.trim()) {
      toast({ message: 'Please enter a project title', variant: 'error' });
      return;
    }

    if (formData.lineItems.length === 0) {
      toast({ message: 'Please add at least one line item', variant: 'error' });
      return;
    }

    try {
      const invoice = createInvoiceObject();
      setCurrentInvoice(invoice);
      setShowPDFExport(true);
    } catch (error) {
      toast({
        message: 'Error preparing PDF: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'error'
      });
    }
  };

  const handlePreview = () => {
    const selectedClient = getSelectedClient();
    if (!selectedClient) {
      toast({ message: 'Please select a client', variant: 'error' });
      return;
    }

    if (!formData.projectTitle.trim()) {
      toast({ message: 'Please enter a project title', variant: 'error' });
      return;
    }

    if (formData.lineItems.length === 0) {
      toast({ message: 'Please add at least one line item', variant: 'error' });
      return;
    }

    try {
      const invoice = createInvoiceObject();
      setCurrentInvoice(invoice);
      setShowPDFExport(true);
    } catch (error) {
      toast({
        message: 'Error preparing preview: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
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

  const isQuoteExpired = () => {
    if (formData.type !== 'quote' || !formData.expiryDate) return false;
    return new Date(formData.expiryDate) < new Date();
  };

  const { subtotal, taxBreakdown, discountAmount, total, balanceDue } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingInvoice ? 'Edit Document' : 'Create New Document'}
              </h1>
              <p className="text-gray-600">
                {editingInvoice ? 
                  `Editing ${editingInvoice.type} ${editingInvoice.number}` : 
                  'Generate professional invoices and quotes'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editingInvoice && (
              <div className="flex items-center gap-2 mr-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(editingInvoice.status)}`}>
                  {editingInvoice.status.charAt(0).toUpperCase() + editingInvoice.status.slice(1)}
                </span>
                {editingInvoice.type === 'quote' && editingInvoice.status !== 'converted' && (
                  <button
                    onClick={handleConvertToInvoice}
                    disabled={isConverting}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isConverting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Convert to Invoice
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Palette className="h-4 w-4" />
              Template
            </button>
            
            {!editingInvoice && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeChange('quote')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.type === 'quote'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Quote
                </button>
                <button
                  onClick={() => handleTypeChange('invoice')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.type === 'invoice'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Document Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'invoice' ? 'Invoice' : 'Quote'} Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {formData.type === 'invoice' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isQuoteExpired() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {isQuoteExpired() && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Clock className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {isQuoteExpired() && (
                    <p className="text-xs text-red-600 mt-1">This quote has expired</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contractor Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Contractor Information
              </h2>
              <button
                onClick={() => setShowContractorForm(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {contractorInfo ? 'Edit Business Info' : 'Setup Business'}
              </button>
            </div>
            
            {contractorInfo ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-4">
                  {contractorInfo.logoUrl && (
                    <div className="w-16 h-16 bg-white rounded-lg border-2 border-blue-200 overflow-hidden flex-shrink-0">
                      <img
                        src={contractorInfo.logoUrl}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{contractorInfo.name}</p>
                      <p className="text-gray-700">{contractorInfo.address}</p>
                      <p className="text-gray-700">{contractorInfo.city}, {contractorInfo.state} {contractorInfo.zipCode}</p>
                      {contractorInfo.website && (
                        <p className="text-blue-600">{contractorInfo.website}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-700">Phone: {contractorInfo.phone}</p>
                      <p className="text-gray-700">Email: {contractorInfo.email}</p>
                      <p className="text-gray-700">License: {contractorInfo.licenseNumber}</p>
                      {contractorInfo.taxId && (
                        <p className="text-gray-700">Tax ID: {contractorInfo.taxId}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Business Setup Required</h4>
                <p className="text-gray-600 mb-4">Configure your business information to appear on invoices</p>
                <button
                  onClick={() => setShowContractorForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Setup Business Information
                </button>
              </div>
            )}
          </div>

          {/* Client Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Client Information
              </h2>
            </div>
            
            <div className="mb-4">
              <ClientSelector
                selectedClientId={formData.clientId}
                onClientSelect={handleClientSelect}
                onAddClient={handleAddClient}
              />
              {errors.clientId && (
                <p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>
              )}
            </div>
            
            {getSelectedClient() && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{getSelectedClient()!.name}</p>
                    {getSelectedClient()!.contactPerson && (
                      <p className="text-gray-700">Contact: {getSelectedClient()!.contactPerson}</p>
                    )}
                    <p className="text-gray-700">{getSelectedClient()!.address}</p>
                    <p className="text-gray-700">{getSelectedClient()!.city}, {getSelectedClient()!.state} {getSelectedClient()!.zipCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Phone: {getSelectedClient()!.phone}</p>
                    <p className="text-gray-700">Email: {getSelectedClient()!.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Project Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  {...register('projectTitle', { onChange: handleInputChange })}
                  name="projectTitle"
                  value={formData.projectTitle}
                  placeholder="Kitchen Renovation, Bathroom Remodel, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.projectTitle && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.projectTitle.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of the work to be performed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Address
                </label>
                <input
                  type="text"
                  name="projectAddress"
                  value={formData.projectAddress}
                  onChange={handleInputChange}
                  placeholder="Job site address (if different from client address)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Project Photos */}
          <ProjectPhotoManager
            photos={formData.projectPhotos}
            onPhotosChange={handleProjectPhotosUpdate}
            isEnabled={formData.templateSettings?.showProjectPhotos || false}
          />

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
          <LineItemsForm
            lineItems={formData.lineItems}
            onUpdateLineItems={handleLineItemsUpdate}
            materialTaxRate={formData.materialTaxRate}
            laborTaxRate={formData.laborTaxRate}
            equipmentTaxRate={formData.equipmentTaxRate}
            otherTaxRate={formData.otherTaxRate}
          />
          {errors.lineItems && (
            <p className="text-red-600 text-sm mt-1">{errors.lineItems.message}</p>
          )}
        </div>

          {/* Advanced Calculations */}
          <AdvancedCalculationsPanel
            materialTaxRate={formData.materialTaxRate}
            laborTaxRate={formData.laborTaxRate}
            equipmentTaxRate={formData.equipmentTaxRate}
            otherTaxRate={formData.otherTaxRate}
            onTaxRateChange={handleTaxRateChange}
            discounts={formData.discounts}
            onDiscountsChange={handleDiscountsChange}
            depositPercentage={formData.depositPercentage}
            depositAmount={formData.depositAmount}
            onDepositChange={handleDepositChange}
            subtotal={subtotal}
            taxBreakdown={taxBreakdown}
            discountAmount={discountAmount}
            total={total}
          />

          {/* Terms and Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional notes or special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{formatCurrency(taxBreakdown.totalTax)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
              
              {formData.depositAmount > 0 && (
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit ({formData.depositPercentage}%):</span>
                    <span className="font-medium text-purple-600">{formatCurrency(formData.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance Due:</span>
                    <span className="font-medium">{formatCurrency(total - formData.depositAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingInvoice ? 'Update' : 'Save'} {formData.type === 'invoice' ? 'Invoice' : 'Quote'}
              </button>
              
              <button
                onClick={handleExportPDF}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              
              <button
                onClick={handlePreview}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientForm
        isOpen={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          setEditingClient(null);
        }}
        onSave={handleClientSave}
        editingClient={editingClient}
      />
      
      <ContractorSetupModal
        isOpen={showContractorForm}
        onClose={() => setShowContractorForm(false)}
        onSave={handleContractorInfoSave}
      />

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onTemplateChange={handleTemplateChange}
        currentTemplate={formData.templateSettings}
      />

      {currentInvoice && (
        <PDFExportModal
          isOpen={showPDFExport}
          onClose={() => setShowPDFExport(false)}
          invoice={currentInvoice}
        />
      )}
    </div>
  );
};

export default InvoiceForm;