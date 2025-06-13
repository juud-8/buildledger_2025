import React, { useState } from 'react';
import { Plus, Trash2, FileText, Save, X, AlertCircle } from 'lucide-react';
import { ChangeOrder, LineItem } from '../types';
import { calculateSubtotal, calculateTaxBreakdown, formatCurrency } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';
import LineItemsForm from './LineItemsForm';

interface ChangeOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (changeOrder: ChangeOrder) => void;
  editingChangeOrder?: ChangeOrder | null;
  nextNumber: string;
  materialTaxRate: number;
  laborTaxRate: number;
  equipmentTaxRate: number;
  otherTaxRate: number;
}

const ChangeOrderForm: React.FC<ChangeOrderFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingChangeOrder,
  nextNumber,
  materialTaxRate,
  laborTaxRate,
  equipmentTaxRate,
  otherTaxRate
}) => {
  const [formData, setFormData] = useState({
    number: editingChangeOrder?.number || nextNumber,
    date: editingChangeOrder?.date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    description: editingChangeOrder?.description || '',
    reason: editingChangeOrder?.reason || '',
    lineItems: editingChangeOrder?.lineItems || [] as LineItem[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemsUpdate = (lineItems: LineItem[]) => {
    setFormData(prev => ({ ...prev, lineItems }));
  };

  const calculateTotals = () => {
    const subtotal = calculateSubtotal(formData.lineItems);
    const taxBreakdown = calculateTaxBreakdown(
      formData.lineItems,
      materialTaxRate,
      laborTaxRate,
      equipmentTaxRate,
      otherTaxRate
    );
    const total = subtotal + taxBreakdown.totalTax;
    
    return { subtotal, taxAmount: taxBreakdown.totalTax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Please enter a description for the change order');
      return;
    }

    if (formData.lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();
    
    const changeOrder: ChangeOrder = {
      id: editingChangeOrder?.id || uuidv4(),
      number: formData.number,
      date: new Date(formData.date),
      description: formData.description,
      lineItems: formData.lineItems,
      subtotal,
      taxAmount,
      total,
      status: editingChangeOrder?.status || 'draft',
      reason: formData.reason || undefined,
      approvedBy: editingChangeOrder?.approvedBy,
      approvedDate: editingChangeOrder?.approvedDate
    };

    onSave(changeOrder);
    onClose();
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">
                {editingChangeOrder ? 'Edit Change Order' : 'New Change Order'}
              </h2>
              <p className="text-orange-100 text-sm">
                Document project scope changes and additional work
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-orange-100 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Change Order Details */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-900 mb-1">Change Order Information</h3>
                    <p className="text-sm text-orange-800">
                      Change orders document modifications to the original project scope, timeline, or cost.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Order Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the changes being made to the project..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Change
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Optional: Explain why this change is necessary..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Line Items */}
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Change Order Items</h3>
                  <p className="text-sm text-gray-600 mt-1">Add items for additional work or modifications</p>
                </div>
                <div className="p-4">
                  <LineItemsForm
                    lineItems={formData.lineItems}
                    onUpdateLineItems={handleLineItemsUpdate}
                    materialTaxRate={materialTaxRate}
                    laborTaxRate={laborTaxRate}
                    equipmentTaxRate={equipmentTaxRate}
                    otherTaxRate={otherTaxRate}
                  />
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Totals */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Change:</span>
                      <span className={total >= 0 ? 'text-orange-600' : 'text-green-600'}>
                        {total >= 0 ? '+' : ''}{formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {total < 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      This change order reduces the project cost
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingChangeOrder ? 'Update' : 'Save'} Change Order
                  </button>
                  
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeOrderForm;