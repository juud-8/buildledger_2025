import React, { useState, useEffect } from 'react';
import { X, Download, Eye, FileText, Loader2 } from 'lucide-react';
import { Invoice } from '../types';
import { generatePDF, previewPDF } from '../utils/pdfExport';
import PDFPreview from './PDFPreview';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

const PDFExportModal: React.FC<PDFExportModalProps> = ({ isOpen, onClose, invoice }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewMode(false);
      setError(null);
    }
  }, [isOpen]);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      await generatePDF(invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">
                {invoice.type === 'invoice' ? 'Invoice' : 'Quote'} Export
              </h2>
              <p className="text-blue-100 text-sm">
                {invoice.number} - {invoice.client.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          {!previewMode ? (
            <div className="p-6 flex-1 flex flex-col items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Export
                </h3>
                <p className="text-gray-600 mb-8">
                  Your {invoice.type} is ready to be exported as a professional PDF document.
                  You can preview it first or download it directly.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handlePreview}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview First
                  </button>
                  
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                  <p className="mb-2">PDF will include:</p>
                  <ul className="text-left space-y-1">
                    <li>• Company branding and logo</li>
                    <li>• Complete project and client information</li>
                    <li>• Detailed line items and calculations</li>
                    <li>• Terms, conditions, and notes</li>
                    <li>• Professional formatting for print</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">PDF Preview</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <PDFPreview invoice={invoice} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFExportModal;