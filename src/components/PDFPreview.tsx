import React from 'react';
import { Invoice } from '../types';
import ModernTemplate from './PDFTemplates/ModernTemplate';
import ClassicTemplate from './PDFTemplates/ClassicTemplate';
import MinimalTemplate from './PDFTemplates/MinimalTemplate';
import ConstructionTemplate from './PDFTemplates/ConstructionTemplate';

interface PDFPreviewProps {
  invoice: Invoice;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ invoice }) => {
  const templateType = invoice.templateSettings?.type || 'modern';

  const renderTemplate = () => {
    switch (templateType) {
      case 'classic':
        return <ClassicTemplate invoice={invoice} />;
      case 'minimal':
        return <MinimalTemplate invoice={invoice} />;
      case 'construction':
        return <ConstructionTemplate invoice={invoice} />;
      default:
        return <ModernTemplate invoice={invoice} />;
    }
  };

  return renderTemplate();
};

export default PDFPreview;