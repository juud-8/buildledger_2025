import React, { useState, useEffect } from 'react';
import { Palette, Eye, Save, RotateCcw, Image, Type, Layout, Brush } from 'lucide-react';
import { TemplateSettings } from '../types';
import { getTemplateSettings, saveTemplateSettings } from '../utils/storage';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateChange: (template: TemplateSettings) => void;
  currentTemplate?: TemplateSettings;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onTemplateChange,
  currentTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSettings>(
    currentTemplate || getDefaultTemplate('modern')
  );
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (currentTemplate) {
      setSelectedTemplate(currentTemplate);
    }
  }, [currentTemplate]);

  const defaultTemplates: TemplateSettings[] = [
    {
      id: 'modern',
      name: 'Modern',
      type: 'modern',
      colorScheme: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      headerStyle: 'standard',
      footerStyle: 'standard',
      showLogo: true,
      showProjectPhotos: false,
      showDetailedBreakdown: true,
      fontFamily: 'Arial',
      fontSize: 'medium'
    },
    {
      id: 'classic',
      name: 'Classic',
      type: 'classic',
      colorScheme: {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#6b7280',
        text: '#111827',
        background: '#ffffff',
        border: '#d1d5db'
      },
      headerStyle: 'centered',
      footerStyle: 'detailed',
      showLogo: true,
      showProjectPhotos: false,
      showDetailedBreakdown: true,
      fontFamily: 'Times',
      fontSize: 'medium'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      type: 'minimal',
      colorScheme: {
        primary: '#000000',
        secondary: '#4b5563',
        accent: '#9ca3af',
        text: '#1f2937',
        background: '#ffffff',
        border: '#f3f4f6'
      },
      headerStyle: 'minimal',
      footerStyle: 'minimal',
      showLogo: false,
      showProjectPhotos: false,
      showDetailedBreakdown: false,
      fontFamily: 'Helvetica',
      fontSize: 'medium'
    },
    {
      id: 'construction',
      name: 'Construction Pro',
      type: 'construction',
      colorScheme: {
        primary: '#ea580c',
        secondary: '#dc2626',
        accent: '#f97316',
        text: '#1f2937',
        background: '#ffffff',
        border: '#fed7aa'
      },
      headerStyle: 'split',
      footerStyle: 'detailed',
      showLogo: true,
      showProjectPhotos: true,
      showDetailedBreakdown: true,
      fontFamily: 'Arial',
      fontSize: 'medium'
    }
  ];

  const colorSchemes = [
    { name: 'Blue Professional', primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
    { name: 'Green Nature', primary: '#059669', secondary: '#047857', accent: '#10b981' },
    { name: 'Orange Construction', primary: '#ea580c', secondary: '#dc2626', accent: '#f97316' },
    { name: 'Purple Creative', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
    { name: 'Gray Professional', primary: '#374151', secondary: '#1f2937', accent: '#6b7280' },
    { name: 'Red Bold', primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' }
  ];

  const fontFamilies = [
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Georgia', value: 'Georgia' }
  ];

  const handleTemplateSelect = (template: TemplateSettings) => {
    setSelectedTemplate(template);
  };

  const handleColorSchemeChange = (colorScheme: any) => {
    setSelectedTemplate(prev => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        primary: colorScheme.primary,
        secondary: colorScheme.secondary,
        accent: colorScheme.accent
      }
    }));
  };

  const handleSettingChange = (field: keyof TemplateSettings, value: any) => {
    setSelectedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    saveTemplateSettings(selectedTemplate);
    onTemplateChange(selectedTemplate);
    onClose();
  };

  const handleReset = () => {
    const defaultTemplate = getDefaultTemplate(selectedTemplate.type);
    setSelectedTemplate(defaultTemplate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">Invoice Templates & Branding</h2>
              <p className="text-purple-100 text-sm">Customize your invoice appearance and branding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-100 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Template Selection */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Layout className="h-5 w-5 text-purple-600" />
                Template Styles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {defaultTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedTemplate.type === template.type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.colorScheme.primary }}
                      ></div>
                      <span className="font-medium text-gray-900">{template.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {template.type === 'modern' && 'Clean, professional design with modern styling'}
                      {template.type === 'classic' && 'Traditional business format with elegant typography'}
                      {template.type === 'minimal' && 'Simple, clean design with minimal elements'}
                      {template.type === 'construction' && 'Industry-specific with project photo support'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Schemes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brush className="h-5 w-5 text-purple-600" />
                Color Schemes
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {colorSchemes.map((scheme, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSchemeChange(scheme)}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.primary }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.secondary }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.accent }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Type className="h-5 w-5 text-purple-600" />
                Typography
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={selectedTemplate.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <select
                    value={selectedTemplate.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                  <select
                    value={selectedTemplate.headerStyle}
                    onChange={(e) => handleSettingChange('headerStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="centered">Centered</option>
                    <option value="split">Split Layout</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Style</label>
                  <select
                    value={selectedTemplate.footerStyle}
                    onChange={(e) => handleSettingChange('footerStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="minimal">Minimal</option>
                    <option value="detailed">Detailed</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.showLogo}
                    onChange={(e) => handleSettingChange('showLogo', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Company Logo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.showProjectPhotos}
                    onChange={(e) => handleSettingChange('showProjectPhotos', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Project Photos</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.showDetailedBreakdown}
                    onChange={(e) => handleSettingChange('showDetailedBreakdown', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Detailed Tax Breakdown</span>
                </label>
              </div>
            </div>

            {/* Custom Header/Footer */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Text</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Header Text</label>
                  <textarea
                    value={selectedTemplate.customHeader || ''}
                    onChange={(e) => handleSettingChange('customHeader', e.target.value)}
                    rows={2}
                    placeholder="Optional custom header text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Text</label>
                  <textarea
                    value={selectedTemplate.customFooter || ''}
                    onChange={(e) => handleSettingChange('customFooter', e.target.value)}
                    rows={2}
                    placeholder="Optional custom footer text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Preview
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
                Template Preview
              </div>
              <div 
                className="p-6 min-h-96 bg-white"
                style={{ 
                  fontFamily: selectedTemplate.fontFamily,
                  fontSize: selectedTemplate.fontSize === 'small' ? '12px' : selectedTemplate.fontSize === 'large' ? '16px' : '14px'
                }}
              >
                {/* Preview Header */}
                <div className={`mb-6 ${selectedTemplate.headerStyle === 'centered' ? 'text-center' : selectedTemplate.headerStyle === 'split' ? 'flex justify-between items-start' : ''}`}>
                  {selectedTemplate.showLogo && (
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded"
                        style={{ backgroundColor: selectedTemplate.colorScheme.primary }}
                      ></div>
                      <div>
                        <h1 className="text-xl font-bold" style={{ color: selectedTemplate.colorScheme.primary }}>
                          Your Company Name
                        </h1>
                      </div>
                    </div>
                  )}
                  
                  {selectedTemplate.customHeader && (
                    <div className="text-sm mb-3" style={{ color: selectedTemplate.colorScheme.text }}>
                      {selectedTemplate.customHeader}
                    </div>
                  )}
                  
                  <div className={selectedTemplate.headerStyle === 'split' ? 'text-right' : ''}>
                    <h2 className="text-lg font-bold mb-2" style={{ color: selectedTemplate.colorScheme.primary }}>
                      INVOICE
                    </h2>
                    <div className="text-sm space-y-1" style={{ color: selectedTemplate.colorScheme.text }}>
                      <p>Invoice #: INV-0001</p>
                      <p>Date: March 15, 2024</p>
                      <p>Due Date: April 14, 2024</p>
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: selectedTemplate.colorScheme.secondary }}>
                      Bill To:
                    </h3>
                    <div className="text-sm space-y-1" style={{ color: selectedTemplate.colorScheme.text }}>
                      <p>Sample Client Name</p>
                      <p>123 Client Street</p>
                      <p>City, State 12345</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: selectedTemplate.colorScheme.secondary }}>
                      Project:
                    </h3>
                    <div className="text-sm" style={{ color: selectedTemplate.colorScheme.text }}>
                      <p>Kitchen Renovation</p>
                    </div>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: selectedTemplate.colorScheme.primary, color: 'white' }}>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Rate</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: `1px solid ${selectedTemplate.colorScheme.border}` }}>
                        <td className="p-2">Sample Line Item</td>
                        <td className="text-right p-2">1</td>
                        <td className="text-right p-2">$1,000.00</td>
                        <td className="text-right p-2">$1,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Preview Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>$1,000.00</span>
                      </div>
                      {selectedTemplate.showDetailedBreakdown && (
                        <div className="flex justify-between">
                          <span>Tax (8.25%):</span>
                          <span>$82.50</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: selectedTemplate.colorScheme.border, color: selectedTemplate.colorScheme.primary }}>
                        <span>Total:</span>
                        <span>$1,082.50</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Footer */}
                {selectedTemplate.footerStyle !== 'none' && (
                  <div className="border-t pt-4" style={{ borderColor: selectedTemplate.colorScheme.border }}>
                    {selectedTemplate.footerStyle === 'detailed' && (
                      <div className="text-sm space-y-1 mb-3" style={{ color: selectedTemplate.colorScheme.text }}>
                        <p>Payment Terms: Net 30</p>
                        <p>Thank you for your business!</p>
                      </div>
                    )}
                    {selectedTemplate.customFooter && (
                      <div className="text-sm" style={{ color: selectedTemplate.colorScheme.text }}>
                        {selectedTemplate.customFooter}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

function getDefaultTemplate(type: string): TemplateSettings {
  const templates = {
    modern: {
      id: 'modern',
      name: 'Modern',
      type: 'modern' as const,
      colorScheme: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      headerStyle: 'standard' as const,
      footerStyle: 'standard' as const,
      showLogo: true,
      showProjectPhotos: false,
      showDetailedBreakdown: true,
      fontFamily: 'Arial' as const,
      fontSize: 'medium' as const
    },
    classic: {
      id: 'classic',
      name: 'Classic',
      type: 'classic' as const,
      colorScheme: {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#6b7280',
        text: '#111827',
        background: '#ffffff',
        border: '#d1d5db'
      },
      headerStyle: 'centered' as const,
      footerStyle: 'detailed' as const,
      showLogo: true,
      showProjectPhotos: false,
      showDetailedBreakdown: true,
      fontFamily: 'Times' as const,
      fontSize: 'medium' as const
    },
    minimal: {
      id: 'minimal',
      name: 'Minimal',
      type: 'minimal' as const,
      colorScheme: {
        primary: '#000000',
        secondary: '#4b5563',
        accent: '#9ca3af',
        text: '#1f2937',
        background: '#ffffff',
        border: '#f3f4f6'
      },
      headerStyle: 'minimal' as const,
      footerStyle: 'minimal' as const,
      showLogo: false,
      showProjectPhotos: false,
      showDetailedBreakdown: false,
      fontFamily: 'Helvetica' as const,
      fontSize: 'medium' as const
    },
    construction: {
      id: 'construction',
      name: 'Construction Pro',
      type: 'construction' as const,
      colorScheme: {
        primary: '#ea580c',
        secondary: '#dc2626',
        accent: '#f97316',
        text: '#1f2937',
        background: '#ffffff',
        border: '#fed7aa'
      },
      headerStyle: 'split' as const,
      footerStyle: 'detailed' as const,
      showLogo: true,
      showProjectPhotos: true,
      showDetailedBreakdown: true,
      fontFamily: 'Arial' as const,
      fontSize: 'medium' as const
    }
  };

  return templates[type as keyof typeof templates] || templates.modern;
}

export default TemplateSelector;