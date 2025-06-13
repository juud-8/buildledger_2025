import React from 'react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface ModernTemplateProps {
  invoice: Invoice;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ invoice }) => {
  const template = invoice.templateSettings;
  const colors = template?.colorScheme || {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
    border: '#e5e7eb'
  };

  return (
    <div 
      id="pdf-content" 
      className="bg-white p-8 max-w-4xl mx-auto"
      style={{ 
        fontFamily: template?.fontFamily || 'Arial, sans-serif',
        fontSize: template?.fontSize === 'small' ? '12px' : template?.fontSize === 'large' ? '16px' : '14px',
        color: colors.text
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {template?.showLogo && invoice.contractorInfo.logoUrl && (
            <img
              src={invoice.contractorInfo.logoUrl}
              alt="Company Logo"
              className="w-20 h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
              {invoice.contractorInfo.name}
            </h1>
            <div className="text-sm space-y-1" style={{ color: colors.text }}>
              <p>{invoice.contractorInfo.address}</p>
              <p>{invoice.contractorInfo.city}, {invoice.contractorInfo.state} {invoice.contractorInfo.zipCode}</p>
              <p>Phone: {invoice.contractorInfo.phone}</p>
              <p>Email: {invoice.contractorInfo.email}</p>
              {invoice.contractorInfo.website && (
                <p style={{ color: colors.primary }}>Website: {invoice.contractorInfo.website}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
            {invoice.type.toUpperCase()}
          </h2>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Number:</span> {invoice.number}</p>
            <p><span className="font-medium">Date:</span> {formatDate(invoice.date)}</p>
            {invoice.dueDate && (
              <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
            )}
            {invoice.expiryDate && (
              <p><span className="font-medium">Expires:</span> {formatDate(invoice.expiryDate)}</p>
            )}
            <p><span className="font-medium">Status:</span> <span className="capitalize">{invoice.status}</span></p>
          </div>
        </div>
      </div>

      {/* Custom Header */}
      {template?.customHeader && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.accent + '20', borderLeft: `4px solid ${colors.primary}` }}>
          <div className="text-sm whitespace-pre-wrap">{template.customHeader}</div>
        </div>
      )}

      {/* License and Insurance Info */}
      <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">License #:</span> {invoice.contractorInfo.licenseNumber}</p>
            {invoice.contractorInfo.taxId && (
              <p><span className="font-medium">Tax ID:</span> {invoice.contractorInfo.taxId}</p>
            )}
          </div>
          {invoice.contractorInfo.insuranceProvider && (
            <div>
              <p><span className="font-medium">Insurance:</span> {invoice.contractorInfo.insuranceProvider}</p>
              {invoice.contractorInfo.insurancePolicyNumber && (
                <p><span className="font-medium">Policy #:</span> {invoice.contractorInfo.insurancePolicyNumber}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bill To and Project Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>Bill To:</h3>
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            <p className="font-medium">{invoice.client.name}</p>
            {invoice.client.contactPerson && (
              <p className="text-sm">Attn: {invoice.client.contactPerson}</p>
            )}
            <p className="text-sm">{invoice.client.address}</p>
            <p className="text-sm">{invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}</p>
            <p className="text-sm">Phone: {invoice.client.phone}</p>
            <p className="text-sm">Email: {invoice.client.email}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>Project Information:</h3>
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.accent + '10', borderLeft: `4px solid ${colors.primary}` }}>
            <h4 className="font-semibold mb-2">{invoice.projectTitle}</h4>
            {invoice.projectDescription && (
              <p className="text-sm mb-2">{invoice.projectDescription}</p>
            )}
            {invoice.projectAddress && (
              <p className="text-sm"><span className="font-medium">Project Address:</span> {invoice.projectAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* Project Photos */}
      {template?.showProjectPhotos && invoice.projectPhotos && invoice.projectPhotos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Project Photos:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {invoice.projectPhotos.slice(0, 6).map((photo) => (
              <div key={photo.id} className="text-center">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  style={{ border: `1px solid ${colors.border}` }}
                />
                <p className="text-xs" style={{ color: colors.text }}>{photo.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Items & Services:</h3>
        <table className="w-full border-collapse" style={{ border: `1px solid ${colors.border}` }}>
          <thead>
            <tr style={{ backgroundColor: colors.primary, color: 'white' }}>
              <th className="px-3 py-2 text-left text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>Description</th>
              <th className="px-3 py-2 text-center text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>Category</th>
              <th className="px-3 py-2 text-center text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>Qty</th>
              <th className="px-3 py-2 text-center text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>Unit</th>
              <th className="px-3 py-2 text-right text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>Rate</th>
              <th className="px-3 py-2 text-right text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : colors.background }}>
                <td className="px-3 py-2 text-sm" style={{ border: `1px solid ${colors.border}` }}>{item.description}</td>
                <td className="px-3 py-2 text-center text-sm capitalize" style={{ border: `1px solid ${colors.border}` }}>
                  {item.category.replace(/([A-Z])/g, ' $1').trim()}
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
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {template?.showDetailedBreakdown && invoice.taxBreakdown && (
                <>
                  {invoice.taxBreakdown.materialTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Materials Tax:</span>
                      <span>{formatCurrency(invoice.taxBreakdown.materialTax)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.laborTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Labor Tax:</span>
                      <span>{formatCurrency(invoice.taxBreakdown.laborTax)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.equipmentTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Equipment Tax:</span>
                      <span>{formatCurrency(invoice.taxBreakdown.equipmentTax)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.otherTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Other Tax:</span>
                      <span>{formatCurrency(invoice.taxBreakdown.otherTax)}</span>
                    </div>
                  )}
                </>
              )}
              
              {!template?.showDetailedBreakdown && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm" style={{ color: colors.accent }}>
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              
              <div className="border-t pt-2" style={{ borderColor: colors.border }}>
                <div className="flex justify-between text-lg font-bold" style={{ color: colors.primary }}>
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {invoice.terms && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>Terms & Conditions:</h3>
          <div className="p-4 rounded-lg text-sm whitespace-pre-wrap" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            {invoice.terms}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>Notes:</h3>
          <div className="p-4 rounded-lg text-sm whitespace-pre-wrap" style={{ backgroundColor: colors.accent + '10', borderLeft: `4px solid ${colors.primary}` }}>
            {invoice.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      {template?.footerStyle !== 'none' && (
        <div className="border-t pt-6 mt-8" style={{ borderColor: colors.border }}>
          {template?.footerStyle === 'detailed' && (
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: colors.secondary }}>Payment Information:</h4>
                <div className="text-sm space-y-1">
                  {invoice.contractorInfo.defaultPaymentTerms && (
                    <p>Payment Terms: {invoice.contractorInfo.defaultPaymentTerms}</p>
                  )}
                  <p>Make checks payable to: {invoice.contractorInfo.name}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{ color: colors.secondary }}>Contact Information:</h4>
                <div className="text-sm space-y-1">
                  <p>Phone: {invoice.contractorInfo.phone}</p>
                  <p>Email: {invoice.contractorInfo.email}</p>
                  {invoice.contractorInfo.website && (
                    <p style={{ color: colors.primary }}>Web: {invoice.contractorInfo.website}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center text-sm" style={{ color: colors.text }}>
            <p className="mb-2">Thank you for your business!</p>
            <p>This {invoice.type} was generated on {formatDate(new Date())}</p>
            {template?.customFooter && (
              <div className="mt-3 whitespace-pre-wrap">{template.customFooter}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTemplate;