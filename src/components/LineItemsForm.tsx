import React from 'react';
import { Plus, Trash2, Package, Wrench, Truck, FileText, DollarSign, Hammer, Zap, Droplets, TreePine, Calculator, Percent } from 'lucide-react';
import { LineItem } from '../types';
import { calculateLineItemTotal, formatCurrency, calculateMarkupAmount, calculateSellingPrice } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';
import QuickAddLineItems from './QuickAddLineItems';
import MobileOptimizedForm from './MobileOptimizedForm';
import TouchFriendlyInput from './TouchFriendlyInput';

interface LineItemsFormProps {
  lineItems: LineItem[];
  onUpdateLineItems: (items: LineItem[]) => void;
  defaultMaterialMarkup?: number;
  defaultLaborMarkup?: number;
  materialTaxRate: number;
  laborTaxRate: number;
  equipmentTaxRate: number;
  otherTaxRate: number;
}

const LineItemsForm: React.FC<LineItemsFormProps> = ({ 
  lineItems, 
  onUpdateLineItems,
  defaultMaterialMarkup = 0,
  defaultLaborMarkup = 0,
  materialTaxRate,
  laborTaxRate,
  equipmentTaxRate,
  otherTaxRate
}) => {
  const addLineItem = () => {
    const newItem: LineItem = {
      id: uuidv4(),
      description: '',
      category: 'material',
      quantity: 1,
      unit: 'ea',
      rate: 0,
      cost: 0,
      markup: defaultMaterialMarkup,
      taxRate: materialTaxRate,
      total: 0
    };
    onUpdateLineItems([...lineItems, newItem]);
  };

  const addQuickLineItem = (item: LineItem) => {
    onUpdateLineItems([...lineItems, item]);
  };

  const updateLineItem = <K extends keyof LineItem>(
    id: string,
    field: K,
    value: LineItem[K]
  ) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-update markup and tax rate when category changes
        if (field === 'category') {
          updatedItem.markup = getDefaultMarkup(value);
          updatedItem.taxRate = getDefaultTaxRate(value);
        }
        
        // Recalculate rate and total when cost or markup changes
        if (field === 'cost' || field === 'markup') {
          const cost = field === 'cost' ? value : (item.cost || 0);
          const markup = field === 'markup' ? value : (item.markup || 0);
          updatedItem.rate = calculateSellingPrice(cost, markup);
          updatedItem.total = calculateLineItemTotal(item.quantity, updatedItem.rate);
        }
        
        // Recalculate total when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.total = calculateLineItemTotal(
            field === 'quantity' ? value : item.quantity,
            field === 'rate' ? value : item.rate
          );
          
          // Update cost if rate changed and we have markup
          if (field === 'rate' && updatedItem.markup && updatedItem.markup > 0) {
            updatedItem.cost = value / (1 + updatedItem.markup / 100);
          }
        }
        
        return updatedItem;
      }
      return item;
    });
    onUpdateLineItems(updatedItems);
  };

  const removeLineItem = (id: string) => {
    onUpdateLineItems(lineItems.filter(item => item.id !== id));
  };

  const getDefaultMarkup = (category: string): number => {
    switch (category) {
      case 'material':
        return defaultMaterialMarkup;
      case 'labor':
        return defaultLaborMarkup;
      default:
        return 0;
    }
  };

  const getDefaultTaxRate = (category: string): number => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'material': return <Package className="h-4 w-4" />;
      case 'labor': return <Wrench className="h-4 w-4" />;
      case 'equipment': return <Truck className="h-4 w-4" />;
      case 'permit': return <FileText className="h-4 w-4" />;
      case 'electrical': return <Zap className="h-4 w-4" />;
      case 'plumbing': return <Droplets className="h-4 w-4" />;
      case 'framing': return <Hammer className="h-4 w-4" />;
      case 'landscaping': return <TreePine className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'material': return 'text-blue-600 bg-blue-50';
      case 'labor': return 'text-orange-600 bg-orange-50';
      case 'equipment': return 'text-purple-600 bg-purple-50';
      case 'permit': return 'text-green-600 bg-green-50';
      case 'electrical': return 'text-yellow-600 bg-yellow-50';
      case 'plumbing': return 'text-cyan-600 bg-cyan-50';
      case 'framing': return 'text-red-600 bg-red-50';
      case 'landscaping': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const constructionCategories = [
    { value: 'material', label: 'Materials' },
    { value: 'labor', label: 'Labor' },
    { value: 'equipment', label: 'Equipment Rental' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'framing', label: 'Framing' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'permit', label: 'Permits & Fees' },
    { value: 'other', label: 'Other' }
  ];

  const commonUnits = [
    { value: 'ea', label: 'ea' },
    { value: 'sq ft', label: 'sq ft' },
    { value: 'lin ft', label: 'lin ft' },
    { value: 'cu ft', label: 'cu ft' },
    { value: 'cu yd', label: 'cu yd' },
    { value: 'sq yd', label: 'sq yd' },
    { value: 'hr', label: 'hr' },
    { value: 'day', label: 'day' },
    { value: 'week', label: 'week' },
    { value: 'lb', label: 'lb' },
    { value: 'ton', label: 'ton' },
    { value: 'gal', label: 'gal' },
    { value: 'board ft', label: 'board ft' },
    { value: 'roll', label: 'roll' },
    { value: 'box', label: 'box' },
    { value: 'bag', label: 'bag' },
    { value: 'pallet', label: 'pallet' },
    { value: 'sheet', label: 'sheet' },
    { value: 'tube', label: 'tube' }
  ];

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Section */}
      <QuickAddLineItems
        onAddLineItem={addQuickLineItem}
        materialTaxRate={materialTaxRate}
        laborTaxRate={laborTaxRate}
        equipmentTaxRate={equipmentTaxRate}
        otherTaxRate={otherTaxRate}
      />

      {/* Main Line Items Section */}
      <MobileOptimizedForm
        title="Line Items"
        subtitle="Add materials, labor, and other project costs"
        actions={
          <button
            type="button"
            onClick={addLineItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        }
      >
        {lineItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No line items added</h4>
            <p className="text-gray-600 mb-4">Start building your invoice by adding materials, labor, and other costs</p>
            <button
              type="button"
              onClick={addLineItem}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table Header - Hidden on Mobile */}
            <div className="hidden lg:block">
              <div className="bg-gray-50 rounded-t-lg border border-gray-200 px-4 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-1">Category</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Unit</div>
                  <div className="col-span-1">Cost</div>
                  <div className="col-span-1">Markup</div>
                  <div className="col-span-1">Rate</div>
                  <div className="col-span-1">Tax%</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Action</div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Mobile Layout */}
                  <div className="lg:hidden p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        {constructionCategories.find(cat => cat.value === item.category)?.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <TouchFriendlyInput
                        label="Description"
                        value={item.description}
                        onChange={(value) => updateLineItem(item.id, 'description', value)}
                        placeholder="Enter item description..."
                        required
                      />
                      
                      <TouchFriendlyInput
                        label="Category"
                        type="select"
                        value={item.category}
                        onChange={(value) => updateLineItem(item.id, 'category', value)}
                        options={constructionCategories}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <TouchFriendlyInput
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(value) => updateLineItem(item.id, 'quantity', parseFloat(value) || 0)}
                          step="0.01"
                          min="0"
                        />
                        <TouchFriendlyInput
                          label="Unit"
                          type="select"
                          value={item.unit}
                          onChange={(value) => updateLineItem(item.id, 'unit', value)}
                          options={commonUnits}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <TouchFriendlyInput
                          label="Cost ($)"
                          type="number"
                          value={item.cost || 0}
                          onChange={(value) => updateLineItem(item.id, 'cost', parseFloat(value) || 0)}
                          step="0.01"
                          min="0"
                        />
                        <TouchFriendlyInput
                          label="Markup (%)"
                          type="number"
                          value={item.markup || 0}
                          onChange={(value) => updateLineItem(item.id, 'markup', parseFloat(value) || 0)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <TouchFriendlyInput
                          label="Rate ($)"
                          type="number"
                          value={item.rate}
                          onChange={(value) => updateLineItem(item.id, 'rate', parseFloat(value) || 0)}
                          step="0.01"
                          min="0"
                        />
                        <TouchFriendlyInput
                          label="Tax (%)"
                          type="number"
                          value={item.taxRate || 0}
                          onChange={(value) => updateLineItem(item.id, 'taxRate', parseFloat(value) || 0)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-900">Line Total:</span>
                          <span className="text-lg font-bold text-blue-900">{formatCurrency(item.total)}</span>
                        </div>
                      </div>

                      {item.notes !== undefined && (
                        <TouchFriendlyInput
                          label="Notes"
                          value={item.notes || ''}
                          onChange={(value) => updateLineItem(item.id, 'notes', value)}
                          placeholder="Optional notes..."
                        />
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <select
                          value={item.category}
                          onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          {constructionCategories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getCategoryColor(item.category)}`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Enter item description..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                        />
                      </div>

                      <div className="col-span-1">
                        <select
                          value={item.unit}
                          onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          {commonUnits.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={item.cost || 0}
                            onChange={(e) => updateLineItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="relative">
                          <input
                            type="number"
                            value={item.markup || 0}
                            onChange={(e) => updateLineItem(item.id, 'markup', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="relative">
                          <input
                            type="number"
                            value={item.taxRate || 0}
                            onChange={(e) => updateLineItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Calculation breakdown for desktop */}
                    {(item.cost || item.markup) && (
                      <div className="mt-2 pt-2 border-t text-xs text-gray-500 grid grid-cols-12 gap-4">
                        <div className="col-span-4"></div>
                        <div className="col-span-8 flex justify-end gap-4">
                          {item.cost && item.markup && (
                            <>
                              <span>Cost: {formatCurrency(item.cost)}</span>
                              <span>Markup: {formatCurrency(calculateMarkupAmount(item.cost, item.markup || 0))}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal Summary */}
            {lineItems.length > 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-blue-800">
                    {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} • Subtotal before tax and discounts
                  </div>
                  <div className="text-lg font-semibold text-blue-900">
                    {formatCurrency(calculateSubtotal())}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </MobileOptimizedForm>
    </div>
  );
};

export default LineItemsForm;