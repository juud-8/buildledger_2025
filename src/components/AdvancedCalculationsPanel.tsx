import React, { useState } from 'react';
import { Calculator, Percent, DollarSign, Settings, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Discount, TaxBreakdown } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface AdvancedCalculationsPanelProps {
  // Tax rates
  materialTaxRate: number;
  laborTaxRate: number;
  equipmentTaxRate: number;
  otherTaxRate: number;
  onTaxRateChange: (category: string, rate: number) => void;
  
  // Discounts
  discounts: Discount[];
  onDiscountsChange: (discounts: Discount[]) => void;
  
  // Deposit
  depositPercentage: number;
  depositAmount: number;
  onDepositChange: (percentage: number) => void;
  
  // Totals for display
  subtotal: number;
  taxBreakdown: TaxBreakdown;
  discountAmount: number;
  total: number;
}

const AdvancedCalculationsPanel: React.FC<AdvancedCalculationsPanelProps> = ({
  materialTaxRate,
  laborTaxRate,
  equipmentTaxRate,
  otherTaxRate,
  onTaxRateChange,
  discounts,
  onDiscountsChange,
  depositPercentage,
  depositAmount,
  onDepositChange,
  subtotal,
  taxBreakdown,
  discountAmount,
  total
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    taxes: boolean;
    discounts: boolean;
    deposit: boolean;
  }>({
    taxes: false,
    discounts: false,
    deposit: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addDiscount = () => {
    const newDiscount: Discount = {
      type: 'percentage',
      value: 0,
      description: '',
      appliesTo: 'subtotal'
    };
    onDiscountsChange([...discounts, newDiscount]);
  };

  const updateDiscount = (index: number, field: keyof Discount, value: any) => {
    const updatedDiscounts = discounts.map((discount, i) => 
      i === index ? { ...discount, [field]: value } : discount
    );
    onDiscountsChange(updatedDiscounts);
  };

  const removeDiscount = (index: number) => {
    onDiscountsChange(discounts.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Advanced Calculations
        </h3>
        <p className="text-sm text-gray-600 mt-1">Configure taxes, discounts, and deposits</p>
      </div>

      <div className="divide-y">
        {/* Tax Rates Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('taxes')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Tax Rates by Category</span>
              <div className="text-sm text-gray-500">
                Total: {formatCurrency(taxBreakdown.totalTax)}
              </div>
            </div>
            {expandedSections.taxes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expandedSections.taxes && (
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Different tax rates for different categories</p>
                    <p>Materials and equipment are often taxed differently than labor in construction projects.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materials Tax Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={materialTaxRate}
                      onChange={(e) => onTaxRateChange('material', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">{formatCurrency(taxBreakdown.materialTax)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Labor Tax Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={laborTaxRate}
                      onChange={(e) => onTaxRateChange('labor', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">{formatCurrency(taxBreakdown.laborTax)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Tax Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={equipmentTaxRate}
                      onChange={(e) => onTaxRateChange('equipment', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">{formatCurrency(taxBreakdown.equipmentTax)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Tax Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={otherTaxRate}
                      onChange={(e) => onTaxRateChange('other', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">{formatCurrency(taxBreakdown.otherTax)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discounts Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('discounts')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="font-medium text-gray-900">Discounts</span>
              <div className="text-sm text-gray-500">
                {discounts.length > 0 ? `${discounts.length} discount${discounts.length !== 1 ? 's' : ''} • ${formatCurrency(discountAmount)}` : 'No discounts'}
              </div>
            </div>
            {expandedSections.discounts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expandedSections.discounts && (
            <div className="mt-4 space-y-4">
              {discounts.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-600 mb-3">No discounts applied</p>
                  <button
                    onClick={addDiscount}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Discount
                  </button>
                </div>
              ) : (
                <>
                  {discounts.map((discount, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={discount.description}
                            onChange={(e) => updateDiscount(index, 'description', e.target.value)}
                            placeholder="e.g., Early payment discount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type & Value
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={discount.type}
                              onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="percentage">%</option>
                              <option value="fixed">$</option>
                            </select>
                            <input
                              type="number"
                              value={discount.value}
                              onChange={(e) => updateDiscount(index, 'value', parseFloat(e.target.value) || 0)}
                              step="0.01"
                              min="0"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Applies To
                          </label>
                          <select
                            value={discount.appliesTo}
                            onChange={(e) => updateDiscount(index, 'appliesTo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="subtotal">Subtotal</option>
                            <option value="total">Total (after tax)</option>
                            <option value="category">Specific Category</option>
                          </select>
                        </div>

                        {discount.appliesTo === 'category' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <select
                              value={discount.category || ''}
                              onChange={(e) => updateDiscount(index, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select category</option>
                              <option value="material">Materials</option>
                              <option value="labor">Labor</option>
                              <option value="equipment">Equipment</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <span className="text-sm text-gray-600">
                          Discount Amount: {formatCurrency(
                            discount.type === 'percentage' 
                              ? (discount.appliesTo === 'subtotal' ? subtotal : total) * (discount.value / 100)
                              : discount.value
                          )}
                        </span>
                        <button
                          onClick={() => removeDiscount(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addDiscount}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                  >
                    Add Another Discount
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Deposit Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('deposit')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-900">Deposit</span>
              <div className="text-sm text-gray-500">
                {depositPercentage > 0 ? `${formatPercentage(depositPercentage)} • ${formatCurrency(depositAmount)}` : 'No deposit'}
              </div>
            </div>
            {expandedSections.deposit ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expandedSections.deposit && (
            <div className="mt-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Deposit Requirements</p>
                    <p>Set a deposit percentage to require upfront payment before work begins.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Percentage (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={depositPercentage}
                    onChange={(e) => onDepositChange(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="100"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">
                    = {formatCurrency(depositAmount)} deposit required
                  </span>
                </div>
                
                <div className="mt-3 flex gap-2">
                  {[10, 25, 50].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => onDepositChange(percentage)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      {percentage}%
                    </button>
                  ))}
                  <button
                    onClick={() => onDepositChange(0)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    No Deposit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedCalculationsPanel;