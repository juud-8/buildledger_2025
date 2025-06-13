import React from 'react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface ConstructionTemplateProps {
  invoice: Invoice;
}

const ConstructionTemplate: React.FC<ConstructionTemplateProps> = ({ invoice }) => {
  const template = invoice.templateSettings;
  const colors = template?.colorScheme || {
    primary: '#ea580c',
    secondary: '#dc2626',
    accent: '#f97316',
    text: '#1f2937',
    background: '#ffffff',
    border: '#fed7aa'
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
      {/* Header with Construction Theme */}
      <div className="relative mb-8">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${colors.primary.replace('#', '%23')}' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative flex justify-between items-start">
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
                <p>📞 {invoice.contractorInfo.phone} • ✉️ {invoice.contractorInfo.email}</p>
                {invoice.contractorInfo.website && (
                  <p style={{ color: colors.primary }}>🌐 {invoice.contractorInfo.website}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right p-4 rounded-lg" style={{ backgroundColor: colors.primary, color: 'white' }}>
            <h2 className="text-2xl font-bold mb-3">
              {invoice.type.toUpperCase()}
            </h2>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">#{invoice.number}</span></p>
              <p>📅 {formatDate(invoice.date)}</p>
              {invoice.dueDate && (
                <p>⏰ Due: {formatDate(invoice.dueDate)}</p>
              )}
              {invoice.expiryDate && (
                <p>⏰ Expires: {formatDate(invoice.expiryDate)}</p>
              )}
              <p className="capitalize">🔧 {invoice.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Header */}
      {template?.customHeader && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.accent + '20', borderLeft: `4px solid ${colors.primary}` }}>
          <div className="text-sm whitespace-pre-wrap font-medium">{template.customHeader}</div>
        </div>
      )}

      {/* License and Safety Info */}
      <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `2px solid ${colors.border}` }}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-bold mb-2" style={{ color: colors.secondary }}>🏗️ Licensing & Certification</h4>
            <p><span className="font-medium">License #:</span> {invoice.contractorInfo.licenseNumber}</p>
            {invoice.contractorInfo.taxId && (
              <p><span className="font-medium">Tax ID:</span> {invoice.contractorInfo.taxId}</p>
            )}
          </div>
          {invoice.contractorInfo.insuranceProvider && (
            <div>
              <h4 className="font-bold mb-2" style={{ color: colors.secondary }}>🛡️ Insurance Coverage</h4>
              <p><span className="font-medium">Provider:</span> {invoice.contractorInfo.insuranceProvider}</p>
              {invoice.contractorInfo.insurancePolicyNumber && (
                <p><span className="font-medium">Policy #:</span> {invoice.contractorInfo.insurancePolicyNumber}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Client and Project Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: colors.secondary }}>
            👤 Client Information
          </h3>
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            <p className="font-bold text-lg mb-1">{invoice.client.name}</p>
            {invoice.client.contactPerson && (
              <p className="text-sm mb-2" style={{ color: colors.secondary }}>Contact: {invoice.client.contactPerson}</p>
            )}
            <p className="text-sm">{invoice.client.address}</p>
            <p className="text-sm">{invoice.client.city}, {invoice.client.state} {invoice.client.zipCode}</p>
            <p className="text-sm mt-2">📞 {invoice.client.phone}</p>
            <p className="text-sm">✉️ {invoice.client.email}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: colors.secondary }}>
            🏗️ Project Details
          </h3>
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.accent + '10', borderLeft: `4px solid ${colors.primary}` }}>
            <h4 className="font-bold text-lg mb-2">{invoice.projectTitle}</h4>
            {invoice.projectDescription && (
              <p className="text-sm mb-2">{invoice.projectDescription}</p>
            )}
            {invoice.projectAddress && (
              <p className="text-sm"><span className="font-medium">📍 Job Site:</span> {invoice.projectAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* Project Photos */}
      {template?.showProjectPhotos && invoice.projectPhotos && invoice.projectPhotos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.secondary }}>
            📸 Project Documentation
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {invoice.projectPhotos.slice(0, 6).map((photo) => (
              <div key={photo.id} className="text-center">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  style={{ border: `2px solid ${colors.border}` }}
                />
                <p className="text-xs font-medium" style={{ color: colors.text }}>{photo.caption}</p>
                <p className="text-xs capitalize" style={{ color: colors.secondary }}>
                  {photo.category === 'before' && '📷 Before'}
                  {photo.category === 'progress' && '🔨 Progress'}
                  {photo.category === 'after' && '✅ After'}
                  {photo.category === 'materials' && '📦 Materials'}
                  {photo.category === 'other' && '🖼️ Other'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Line Items with Construction Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: colors.secondary }}>
          📋 Work Breakdown & Materials
        </h3>
        <table className="w-full border-collapse" style={{ border: `2px solid ${colors.primary}` }}>
          <thead>
            <tr style={{ backgroundColor: colors.primary, color: 'white' }}>
              <th className="px-3 py-3 text-left font-bold" style={{ border: `1px solid ${colors.primary}` }}>Description</th>
              <th className="px-3 py-3 text-center font-bold" style={{ border: `1px solid ${colors.primary}` }}>Category</th>
              <th className="px-3 py-3 text-center font-bold" style={{ border: `1px solid ${colors.primary}` }}>Qty</th>
              <th className="px-3 py-3 text-center font-bold" style={{ border: `1px solid ${colors.primary}` }}>Unit</th>
              <th className="px-3 py-3 text-right font-bold" style={{ border: `1px solid ${colors.primary}` }}>Rate</th>
              <th className="px-3 py-3 text-right font-bold" style={{ border: `1px solid ${colors.primary}` }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => {
              const getCategoryIcon = (category: string) => {
                switch (category) {
                  case 'material': return '📦';
                  case 'labor': return '👷';
                  case 'equipment': return '🚛';
                  case 'electrical': return '⚡';
                  case 'plumbing': return '🔧';
                  case 'framing': return '🔨';
                  case 'landscaping': return '🌱';
                  case 'permit': return '📋';
                  default: return '🔧';
                }
              };

              return (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : colors.background }}>
                  <td className="px-3 py-2 text-sm" style={{ border: `1px solid ${colors.border}` }}>
                    <div className="font-medium">{item.description}</div>
                    {item.notes && (
                      <div className="text-xs mt-1 italic" style={{ color: colors.secondary }}>{item.notes}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-sm" style={{ border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center justify-center gap-1">
                      <span>{getCategoryIcon(item.category)}</span>
                      <span className="capitalize text-xs">
                        {item.category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-sm" style={{ border: `1px solid ${colors.border}` }}>{item.quantity}</td>
                  <td className="px-3 py-2 text-center text-sm" style={{ border: `1px solid ${colors.border}` }}>{item.unit}</td>
                  <td className="px-3 py-2 text-right text-sm" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(item.rate)}</td>
                  <td className="px-3 py-2 text-right text-sm font-medium" style={{ border: `1px solid ${colors.border}` }}>{formatCurrency(item.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals with Construction Styling */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background, border: `2px solid ${colors.primary}` }}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span>💰</span>
                  <span>Subtotal:</span>
                </span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {template?.showDetailedBreakdown && invoice.taxBreakdown ? (
                <>
                  {invoice.taxBreakdown.materialTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span>📦</span>
                        <span>Materials Tax:</span>
                      </span>
                      <span>{formatCurrency(invoice.taxBreakdown.materialTax)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.laborTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span>👷</span>
                        <span>Labor Tax:</span>
                      </span>
                      <span>{formatCurrency(invoice.taxBreakdown.laborTax)}</span>
                    </div>
                  )}
                  {invoice.taxBreakdown.equipmentTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span>🚛</span>
                        <span>Equipment Tax:</span>
                      </span>
                      <span>{formatCurrency(invoice.taxBreakdown.equipmentTax)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <span>🧾</span>
                    <span>Tax:</span>
                  </span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm" style={{ color: colors.accent }}>
                  <span className="flex items-center gap-1">
                    <span>💸</span>
                    <span>Discount:</span>
                  </span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              
              <div className="border-t-2 pt-2 mt-3" style={{ borderColor: colors.primary }}>
                <div className="flex justify-between text-lg font-bold" style={{ color: colors.primary }}>
                  <span className="flex items-center gap-1">
                    <span>💵</span>
                    <span>TOTAL:</span>
                  </span>
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
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: colors.secondary }}>
            📜 Terms & Conditions
          </h3>
          <div className="p-4 rounded-lg text-sm whitespace-pre-wrap" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
            {invoice.terms}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: colors.secondary }}>
            📝 Project Notes
          </h3>
          <div className="p-4 rounded-lg text-sm whitespace-pre-wrap" style={{ backgroundColor: colors.accent + '10', borderLeft: `4px solid ${colors.primary}` }}>
            {invoice.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      {template?.footerStyle !== 'none' && (
        <div className="border-t-2 pt-6 mt-8" style={{ borderColor: colors.primary }}>
          {template?.footerStyle === 'detailed' && (
            <div className="grid grid-cols-3 gap-6 mb-6 text-sm">
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-1" style={{ color: colors.secondary }}>
                  <span>💳</span>
                  <span>Payment Info</span>
                </h4>
                <div className="space-y-1">
                  {invoice.contractorInfo.defaultPaymentTerms && (
                    <p>Terms: {invoice.contractorInfo.defaultPaymentTerms}</p>
                  )}
                  <p>Make checks payable to:</p>
                  <p className="font-medium">{invoice.contractorInfo.name}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-1" style={{ color: colors.secondary }}>
                  <span>📞</span>
                  <span>Contact</span>
                </h4>
                <div className="space-y-1">
                  <p>Phone: {invoice.contractorInfo.phone}</p>
                  <p>Email: {invoice.contractorInfo.email}</p>
                  {invoice.contractorInfo.website && (
                    <p style={{ color: colors.primary }}>Web: {invoice.contractorInfo.website}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-1" style={{ color: colors.secondary }}>
                  <span>🏗️</span>
                  <span>Quality Promise</span>
                </h4>
                <div className="space-y-1 text-xs">
                  <p>Licensed & Insured</p>
                  <p>Quality Workmanship</p>
                  <p>Customer Satisfaction</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center text-sm p-4 rounded-lg" style={{ backgroundColor: colors.primary, color: 'white' }}>
            <p className="font-bold mb-2">🙏 Thank you for choosing {invoice.contractorInfo.name}!</p>
            <p>Building your dreams with quality and integrity.</p>
            <p className="mt-2 text-xs opacity-90">This {invoice.type} was generated on {formatDate(new Date())}</p>
            {template?.customFooter && (
              <div className="mt-3 whitespace-pre-wrap text-xs opacity-90">{template.customFooter}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionTemplate;