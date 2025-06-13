import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Calculator, Eye } from 'lucide-react';

interface MobileOptimizedFormProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
}

const MobileOptimizedForm: React.FC<MobileOptimizedFormProps> = ({
  children,
  title,
  subtitle,
  isCollapsible = false,
  defaultExpanded = true,
  actions
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-4">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            {isCollapsible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {(!isCollapsible || isExpanded) && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedForm;