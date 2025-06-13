import React from 'react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface MinimalTemplateProps {
  invoice: Invoice;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ invoice }) => {
  const template = invoice.templateSettings;
  const colors = template?.colorScheme || {
    primary: '#000000',
    secondary: '#4b5563',
    accent: '#9ca3af',
    text: '#1f2937',
    background: '#ffffff',
    border: '#f3f4f6'
  };

  return (
    <div 
      id="pdf-content" 
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ 
        fontFamily: template?.fontFamily || 'Helvetica, sans-serif',
        fontSize: template?.fontSize === 'small' ? '12px' : template?.fontSize === 'large' ? '16px' : '14px',
        color: colors.text
      }}
    >
      {/* Header - Minimal */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-2xl font-light mb-1" style={{ color: colors.primary }}>
            {invoice.contractorInfo.name}
          </h1>
          <div className="text-sm space-y-0.5" style={{ color: colors.secondary }}>
            <p>{invoice.contractorInfo.address}</p>
            <p>{invoice.contractorInfo.city}, {invoice.contractorInfo.state} {invoice.contractorInfo.zipCode}</p>
            <p>{invoice.contractorInfo.phone} • {invoice.contractorInfo.email}</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-3xl font-light mb-4" style={{ color: colors.primary }}>
            {invoice.type.toUpperCase()}
          </h2>
          <div className="text-sm space-y-1" style={{ color: colors.secondary }}>
            <p>{invoice.number}</p>
            <p>{formatDate(invoice.date)}</p>
            {invoice.dueDate && <p>Due: {formatDate(invoice.dueDate)}</p>}
            {invoice.expiryDate && <p>Expires: {formatDate(invoice.expiryDate)}</p>}
          </div>
        </div>
      </div>

      {/* Custom Header */}
      {template?.customHeader && (
        <div className="mb-8 text-sm" style={{ color: colors.secondary }}>
          <div className="whitespace-pre-wrap">{template.customHeader}</div>
        </div>
      )}

      {/* Client and Project Info */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: colors.primary }}>
            Bill To
          </h3>
          <div className="text-sm space-y-1" style={{ color: colors.text }}>
            <p className="font-medium">{invoice.client.name}</p>
            {invoice.client.contactPerson && (
              <p style={{ color: colors.secondary }}>{invoice.client.contactPerson}</p>
            )}
            <p>{invoice.client.address}</p>
            <p>{invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}</p>
            <p>{invoice.client.phone}</p>
            <p>{invoice.client.email}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: colors.primary }}>
            Project
          </h3>
          <div className="text-sm space-y-1" style={{ color: colors.text }}>
            <p className="font-medium">{invoice.projectTitle}</p>
            {invoice.projectDescription && (
              <p style={{ color: colors.secondary }}>{invoice.projectDescription}</p>
            )}
            {invoice.projectAddress && (
              <p>{invoice.projectAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items - Minimal Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: colors.primary }}>
              <th className="text-left py-3 text-sm font-medium uppercase tracking-wide" style={{ color: colors.primary }}>
                Description
              </th>
              <th className="text-right py-3 text-sm font-medium uppercase tracking-wide" style={{ color: colors.primary }}>
                Qty
              </th>
              <th className="text-right py-3 text-sm font-medium uppercase tracking-wide" style={{ color: colors.primary }}>
                Rate
              </th>
              <th className="text-right py-3 text-sm font-medium uppercase tracking-wide" style={{ color: colors.primary }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={item.id} className={index < invoice.lineItems.length - 1 ? 'border-b' : ''} style={{ borderColor: colors.border }}>
                <td className="py-3 text-sm">
                  <div>{item.description}</div>
                  <div className="text-xs mt-1 capitalize" style={{ color: colors.secondary }}>
                    {item.category.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </td>
                <td className="text-right py-3 text-sm" style={{ color: colors.secondary }}>
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right py-3 text-sm" style={{ color: colors.secondary }}>
                  {formatCurrency(item.rate)}
                </td>
                <td className="text-right py-3 text-sm font-medium">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals - Minimal */}
      <div className="flex justify-end mb-12">
        <div className="w-64">
          <div className="space-y-2">
            <div className="flex justify-between text-sm" style={{ color: colors.secondary }}>
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm" style={{ color: colors.secondary }}>
              <span>Tax</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: colors.accent }}>
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            
            <div className="border-t pt-2 mt-4" style={{ borderColor: colors.primary }}>
              <div className="flex justify-between text-lg font-medium" style={{ color: colors.primary }}>
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms - Minimal */}
      {invoice.terms && (
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: colors.primary }}>
            Terms
          </h3>
          <div className="text-sm whitespace-pre-wrap" style={{ color: colors.secondary }}>
            {invoice.terms}
          </div>
        </div>
      )}

      {/* Notes - Minimal */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: colors.primary }}>
            Notes
          </h3>
          <div className="text-sm whitespace-pre-wrap" style={{ color: colors.secondary }}>
            {invoice.notes}
          </div>
        </div>
      )}

      {/* Footer - Minimal */}
      {template?.footerStyle !== 'none' && (
        <div className="border-t pt-8 mt-12" style={{ borderColor: colors.border }}>
          <div className="text-center text-sm" style={{ color: colors.secondary }}>
            <p>Thank you</p>
            {template?.customFooter && (
              <div className="mt-2 whitespace-pre-wrap">{template.customFooter}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalTemplate;