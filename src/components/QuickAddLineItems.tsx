import React, { useState } from 'react';
import { Plus, Zap, Package, Wrench, Truck, FileText, Hammer, Droplets, TreePine } from 'lucide-react';
import { LineItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface QuickAddLineItemsProps {
  onAddLineItem: (item: LineItem) => void;
  materialTaxRate: number;
  laborTaxRate: number;
  equipmentTaxRate: number;
  otherTaxRate: number;
}

const QuickAddLineItems: React.FC<QuickAddLineItemsProps> = ({
  onAddLineItem,
  materialTaxRate,
  laborTaxRate,
  equipmentTaxRate,
  otherTaxRate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const commonItems = [
    // Materials
    {
      category: 'material' as const,
      description: 'Lumber - 2x4x8',
      unit: 'ea',
      rate: 8.50,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      category: 'material' as const,
      description: 'Drywall - 4x8 sheet',
      unit: 'sheet',
      rate: 15.00,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      category: 'material' as const,
      description: 'Paint - Interior (gallon)',
      unit: 'gal',
      rate: 45.00,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      category: 'material' as const,
      description: 'Concrete - Ready Mix',
      unit: 'cu yd',
      rate: 120.00,
      icon: Package,
      color: 'bg-blue-500'
    },
    
    // Labor
    {
      category: 'labor' as const,
      description: 'General Labor',
      unit: 'hr',
      rate: 35.00,
      icon: Wrench,
      color: 'bg-orange-500'
    },
    {
      category: 'labor' as const,
      description: 'Skilled Carpenter',
      unit: 'hr',
      rate: 55.00,
      icon: Hammer,
      color: 'bg-orange-500'
    },
    {
      category: 'labor' as const,
      description: 'Project Management',
      unit: 'hr',
      rate: 75.00,
      icon: Wrench,
      color: 'bg-orange-500'
    },
    
    // Equipment
    {
      category: 'equipment' as const,
      description: 'Excavator Rental',
      unit: 'day',
      rate: 350.00,
      icon: Truck,
      color: 'bg-purple-500'
    },
    {
      category: 'equipment' as const,
      description: 'Dumpster Rental',
      unit: 'week',
      rate: 275.00,
      icon: Truck,
      color: 'bg-purple-500'
    },
    
    // Electrical
    {
      category: 'electrical' as const,
      description: 'Electrical Outlet Installation',
      unit: 'ea',
      rate: 125.00,
      icon: Zap,
      color: 'bg-yellow-500'
    },
    {
      category: 'electrical' as const,
      description: 'Light Fixture Installation',
      unit: 'ea',
      rate: 85.00,
      icon: Zap,
      color: 'bg-yellow-500'
    },
    
    // Plumbing
    {
      category: 'plumbing' as const,
      description: 'Faucet Installation',
      unit: 'ea',
      rate: 150.00,
      icon: Droplets,
      color: 'bg-cyan-500'
    },
    {
      category: 'plumbing' as const,
      description: 'Toilet Installation',
      unit: 'ea',
      rate: 200.00,
      icon: Droplets,
      color: 'bg-cyan-500'
    },
    
    // Other
    {
      category: 'permit' as const,
      description: 'Building Permit',
      unit: 'ea',
      rate: 250.00,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      category: 'landscaping' as const,
      description: 'Sod Installation',
      unit: 'sq ft',
      rate: 2.50,
      icon: TreePine,
      color: 'bg-emerald-500'
    }
  ];

  const getTaxRate = (category: string) => {
    switch (category) {
      case 'material': return materialTaxRate;
      case 'labor': return laborTaxRate;
      case 'equipment': return equipmentTaxRate;
      default: return otherTaxRate;
    }
  };

  const handleQuickAdd = (item: typeof commonItems[0]) => {
    const lineItem: LineItem = {
      id: uuidv4(),
      description: item.description,
      category: item.category,
      quantity: 1,
      unit: item.unit,
      rate: item.rate,
      taxRate: getTaxRate(item.category),
      total: item.rate
    };
    
    onAddLineItem(lineItem);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Quick Add Common Items</span>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <Plus className="h-4 w-4 text-gray-400" />
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {commonItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAdd(item)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${item.rate.toFixed(2)} per {item.unit}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> These are common construction items with typical rates. 
              You can adjust quantities and rates after adding them to your invoice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAddLineItems;