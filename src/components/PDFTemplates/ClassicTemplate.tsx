import React from 'react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface ClassicTemplateProps {
  invoice: Invoice;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ invoice }) => {
  const template = invoice.templateSettings;
  const colors = template?.colorScheme || {
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#6b7280',
    text: '#111827',
    background: '#ffffff',
    border: '#d1d5db'
  };

  return (
    <div 
      id="pdf-content" 
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ 
        fontFamily: template?.fontFamily || 'Times, serif',
        fontSize: template?.fontSize === 'small' ? '12px' : template?.fontSize === 'large' ? '16px' : '14px',
        color: colors.text
      }}
    >
      {/* Decorative Border */}
      <div className="border-4 border-double p-6" style={{ borderColor: colors.primary }}>
        
        {/* Header - Centered */}
        <div className="text-center mb-8">
          {template?.showLogo && invoice.contractorInfo.logoUrl && (
            <div className="mb-4">
              <img
                src={invoice.contractorInfo.logoUrl}
                alt="Company Logo"
                className="w-24 h-24 object-contain mx-auto"
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary, fontFamily: 'Times, serif' }}>
            {invoice.contractorInfo.name}
          </h1>
          
          <div className="text-sm mb-4" style={{ color: colors.text }}>
            <p>{invoice.contractorInfo.address}</p>
            <p>{invoice.contractorInfo.city}, {invoice.contractorInfo.state} {invoice.contractorInfo.zipCode}</p>
            <p>Telephone: {invoice.contractorInfo.phone} • Email: {invoice.contractorInfo.email}</p>
            {invoice.contractorInfo.website && (
              <p style={{ color: colors.primary }}>{invoice.contractorInfo.website}</p>
            )}
          </div>
          
          <div className="border-t border-b py-2 mb-4" style={{ borderColor: colors.border }}>
            <p className="text-sm font-medium">
              Licensed Contractor • License #{invoice.contractorInfo.licenseNumber}
              {invoice.contractorInfo.taxId && ` • Tax ID: ${invoice.contractorInfo.taxId}`}
            </p>
          </div>
          
          <h2 className="text-3xl font-bold" style={{ color: colors.primary, fontFamily: 'Times, serif' }}>
            {invoice.type.toUpperCase()}
          </h2>
        </div>

        {/* Custom Header */}
        {template?.customHeader && (
          <div className="text-center mb-6 p-3" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            <div className="text-sm whitespace-pre-wrap font-style: italic">{template.customHeader}</div>
          </div>
        )}

        {/* Document Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-3 underline" style={{ color: colors.secondary }}>Invoice Details:</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium py-1">Invoice Number:</td>
                  <td className="py-1">{invoice.number}</td>
                </tr>
                <tr>
                  <td className="font-medium py-1">Date Issued:</td>
                  <td className="py-1">{formatDate(invoice.date)}</td>
                </tr>
                {invoice.dueDate && (
                  <tr>
                    <td className="font-medium py-1">Payment Due:</td>
                    <td className="py-1">{formatDate(invoice.dueDate)}</td>
                  </tr>
                )}
                {invoice.expiryDate && (
                  <tr>
                    <td className="font-medium py-1">Quote Expires:</td>
                    <td className="py-1">{formatDate(invoice.expiryDate)}</td>
                  </tr>
                )}
                <tr>
                  <td className="font-medium py-1">Status:</td>
                  <td className="py-1 capitalize">{invoice.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3 underline" style={{ color: colors.secondary }}>Bill To:</h3>
            <div className="text-sm">
              <p className="font-bold text-base mb-1">{invoice.client.name}</p>
              {invoice.client.contactPerson && (
                <p className="italic">Attention: {invoice.client.contactPerson}</p>
              )}
              <p>{invoice.client.address}</p>
              <p>{invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}</p>
              <p className="mt-2">Telephone: {invoice.client.phone}</p>
              <p>Email: {invoice.client.email}</p>
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-3 underline" style={{ color: colors.secondary }}>Project Information:</h3>
          <div className="p-4" style={{ backgroundColor: colors.background, border: `2px solid ${colors.border}` }}>
            <h4 className="font-bold text-lg mb-2">{invoice.projectTitle}</h4>
            {invoice.projectDescription && (
              <p className="text-sm mb-2 italic">{invoice.projectDescription}</p>
            )}
            {invoice.projectAddress && (
              <p className="text-sm"><span className="font-medium">Project Location:</span> {invoice.projectAddress}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 underline" style={{ color: colors.secondary }}>Description of Work & Materials:</h3>
          <table className="w-full border-collapse" style={{ border: `2px solid ${colors.primary}` }}>
            <thead>
              <tr style={{ backgroundColor: colors.primary, color: 'white' }}>
                <th className="px-3 py-3 text-left font-bold" style={{ border: `1px solid ${colors.primary}` }}>Description</th>
                <th className="px-3 py-3 text-center font-bold" style={{ border: `1px solid ${colors.primary}` }}>Quantity</th>
                <th className="px-3 py-3 text-center font-bold" style={{ border: `1px solid ${colors.primary}` }}>Unit</th>
                <th className="px-3 py-3 text-right font-bold" style={{ border: `1px solid ${colors.primary}` }}>Unit Price</th>
                <th className="px-3 py-3 text-right font-bold" style={{ border: `1px solid ${colors.primary}` }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : colors.background }}>
                  <td className="px-3 py-2 text-sm" style={{ border: `1px solid ${colors.border}` }}>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs italic capitalize" style={{ color: colors.accent }}>
                      {item.category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-sm" style={{ border: `1px solid ${colors.border}` }}>{item.quantity}</td>
                  <td className="px-3 py-2 text-center text-sm" style={{ border: `1px solid ${colors.border}` }}>{item.unit}</td>
                  <td className="px-3 py-2 text-right text-sm" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(item.rate)}</td>
                  <td className="px-3 py-2 text-right text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <table className="w-full" style={{ border: `2px solid ${colors.primary}` }}>
              <tbody>
                <tr style={{ backgroundColor: colors.background }}>
                  <td className="px-4 py-2 font-medium" style={{ border: `1px solid ${colors.border}` }}>Subtotal:</td>
                  <td className="px-4 py-2 text-right" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(invoice.subtotal)}</td>
                </tr>
                
                {template?.showDetailedBreakdown && invoice.taxBreakdown ? (
                  <>
                    {invoice.taxBreakdown.materialTax > 0 && (
                      <tr style={{ backgroundColor: colors.background }}>
                        <td className="px-4 py-2 font-medium" style={{ border: `1px solid ${colors.border}` }}>Materials Tax:</td>
                        <td className="px-4 py-2 text-right" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(invoice.taxBreakdown.materialTax)}</td>
                      </tr>
                    )}
                    {invoice.taxBreakdown.laborTax > 0 && (
                      <tr style={{ backgroundColor: colors.background }}>
                        <td className="px-4 py-2 font-medium" style={{ border: `1px solid ${colors.border}` }}>Labor Tax:</td>
                        <td className="px-4 py-2 text-right" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(invoice.taxBreakdown.laborTax)}</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr style={{ backgroundColor: colors.background }}>
                    <td className="px-4 py-2 font-medium" style={{ border: `1px solid ${colors.border}` }}>Tax:</td>
                    <td className="px-4 py-2 text-right" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(invoice.taxAmount)}</td>
                  </tr>
                )}
                
                {invoice.discountAmount > 0 && (
                  <tr style={{ backgroundColor: colors.background }}>
                    <td className="px-4 py-2 font-medium" style={{ border: `1px solid ${colors.border}` }}>Discount:</td>
                    <td className="px-4 py-2 text-right" style={{ border: `1px solid ${colors.border}`, color: colors.accent }}>-{formatCurrency(invoice.discountAmount)}</td>
                  </tr>
                )}
                
                <tr style={{ backgroundColor: colors.primary, color: 'white' }}>
                  <td className="px-4 py-3 font-bold text-lg" style={{ border: `1px solid ${colors.primary}` }}>TOTAL AMOUNT DUE:</td>
                  <td className="px-4 py-3 text-right font-bold text-lg" style={{ border: `1px solid ${colors.primary}` }}>{formatCurrency(invoice.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Conditions */}
        {invoice.terms && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 underline" style={{ color: colors.secondary }}>Terms & Conditions:</h3>
            <div className="p-4 text-sm whitespace-pre-wrap" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
              {invoice.terms}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 underline" style={{ color: colors.secondary }}>Additional Notes:</h3>
            <div className="p-4 text-sm whitespace-pre-wrap italic" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
              {invoice.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        {template?.footerStyle !== 'none' && (
          <div className="border-t-2 pt-6 mt-8" style={{ borderColor: colors.primary }}>
            {template?.footerStyle === 'detailed' && (
              <div className="grid grid-cols-2 gap-8 mb-4 text-sm">
                <div>
                  <h4 className="font-bold mb-2 underline" style={{ color: colors.secondary }}>Payment Instructions:</h4>
                  <div className="space-y-1">
                    {invoice.contractorInfo.defaultPaymentTerms && (
                      <p><span className="font-medium">Terms:</span> {invoice.contractorInfo.defaultPaymentTerms}</p>
                    )}
                    <p><span className="font-medium">Make checks payable to:</span> {invoice.contractorInfo.name}</p>
                    <p><span className="font-medium">Remit payment to address above</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2 underline" style={{ color: colors.secondary }}>Questions or Concerns:</h4>
                  <div className="space-y-1">
                    <p><span className="font-medium">Phone:</span> {invoice.contractorInfo.phone}</p>
                    <p><span className="font-medium">Email:</span> {invoice.contractorInfo.email}</p>
                    {invoice.contractorInfo.website && (
                      <p><span className="font-medium">Website:</span> {invoice.contractorInfo.website}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center text-sm border-t pt-4" style={{ borderColor: colors.border }}>
              <p className="font-bold mb-2">Thank you for choosing {invoice.contractorInfo.name}</p>
              <p>We appreciate your business and look forward to serving you again.</p>
              <p className="mt-2 italic">This {invoice.type} was prepared on {formatDate(new Date())}</p>
              {template?.customFooter && (
                <div className="mt-3 whitespace-pre-wrap italic">{template.customFooter}</div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ClassicTemplate;