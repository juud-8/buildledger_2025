import { 
  DigitalSignature, 
  LienWaiver, 
  EquipmentRental, 
  WarrantyDocument, 
  DocumentTemplate,
  DocumentAttachment,
  ChangeOrder
} from '../types';

const DOCUMENT_STORAGE_KEYS = {
  DIGITAL_SIGNATURES: 'buildledger_digital_signatures',
  LIEN_WAIVERS: 'buildledger_lien_waivers',
  EQUIPMENT_RENTALS: 'buildledger_equipment_rentals',
  WARRANTIES: 'buildledger_warranties',
  DOCUMENT_TEMPLATES: 'buildledger_document_templates',
  DOCUMENT_ATTACHMENTS: 'buildledger_document_attachments',
  CHANGE_ORDERS: 'buildledger_change_orders'
};

// Digital Signatures
export const getDigitalSignatures = (): DigitalSignature[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.DIGITAL_SIGNATURES);
  if (!stored) return [];
  
  try {
    const signatures = JSON.parse(stored);
    return signatures.map((sig: any) => ({
      ...sig,
      signatureDate: new Date(sig.signatureDate)
    }));
  } catch {
    return [];
  }
};

export const saveDigitalSignature = (signature: DigitalSignature): void => {
  const signatures = getDigitalSignatures();
  const existingIndex = signatures.findIndex(s => s.id === signature.id);
  
  if (existingIndex >= 0) {
    signatures[existingIndex] = signature;
  } else {
    signatures.push(signature);
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.DIGITAL_SIGNATURES, JSON.stringify(signatures));
};

export const deleteDigitalSignature = (signatureId: string): void => {
  const signatures = getDigitalSignatures().filter(s => s.id !== signatureId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.DIGITAL_SIGNATURES, JSON.stringify(signatures));
};

// Lien Waivers
export const getLienWaivers = (): LienWaiver[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.LIEN_WAIVERS);
  if (!stored) return [];
  
  try {
    const waivers = JSON.parse(stored);
    return waivers.map((waiver: any) => ({
      ...waiver,
      throughDate: new Date(waiver.throughDate),
      createdDate: new Date(waiver.createdDate),
      effectiveDate: new Date(waiver.effectiveDate),
      signature: waiver.signature ? {
        ...waiver.signature,
        signatureDate: new Date(waiver.signature.signatureDate)
      } : undefined
    }));
  } catch {
    return [];
  }
};

export const saveLienWaiver = (waiver: LienWaiver): void => {
  const waivers = getLienWaivers();
  const existingIndex = waivers.findIndex(w => w.id === waiver.id);
  
  if (existingIndex >= 0) {
    waivers[existingIndex] = waiver;
  } else {
    waivers.push(waiver);
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.LIEN_WAIVERS, JSON.stringify(waivers));
};

export const deleteLienWaiver = (waiverId: string): void => {
  const waivers = getLienWaivers().filter(w => w.id !== waiverId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.LIEN_WAIVERS, JSON.stringify(waivers));
};

// Equipment Rentals
export const getEquipmentRentals = (): EquipmentRental[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.EQUIPMENT_RENTALS);
  if (!stored) return [];
  
  try {
    const rentals = JSON.parse(stored);
    return rentals.map((rental: any) => ({
      ...rental,
      startDate: new Date(rental.startDate),
      endDate: new Date(rental.endDate),
      attachments: rental.attachments ? rental.attachments.map((att: any) => ({
        ...att,
        uploadDate: new Date(att.uploadDate)
      })) : []
    }));
  } catch {
    return [];
  }
};

export const saveEquipmentRental = (rental: EquipmentRental): void => {
  const rentals = getEquipmentRentals();
  const existingIndex = rentals.findIndex(r => r.id === rental.id);
  
  if (existingIndex >= 0) {
    rentals[existingIndex] = rental;
  } else {
    rentals.push(rental);
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.EQUIPMENT_RENTALS, JSON.stringify(rentals));
};

export const deleteEquipmentRental = (rentalId: string): void => {
  const rentals = getEquipmentRentals().filter(r => r.id !== rentalId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.EQUIPMENT_RENTALS, JSON.stringify(rentals));
};

// Warranties
export const getWarranties = (): WarrantyDocument[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.WARRANTIES);
  if (!stored) return [];
  
  try {
    const warranties = JSON.parse(stored);
    return warranties.map((warranty: any) => ({
      ...warranty,
      warrantyStartDate: new Date(warranty.warrantyStartDate),
      warrantyEndDate: new Date(warranty.warrantyEndDate),
      createdDate: new Date(warranty.createdDate),
      contractorSignature: warranty.contractorSignature ? {
        ...warranty.contractorSignature,
        signatureDate: new Date(warranty.contractorSignature.signatureDate)
      } : undefined,
      clientSignature: warranty.clientSignature ? {
        ...warranty.clientSignature,
        signatureDate: new Date(warranty.clientSignature.signatureDate)
      } : undefined
    }));
  } catch {
    return [];
  }
};

export const saveWarranty = (warranty: WarrantyDocument): void => {
  const warranties = getWarranties();
  const existingIndex = warranties.findIndex(w => w.id === warranty.id);
  
  if (existingIndex >= 0) {
    warranties[existingIndex] = warranty;
  } else {
    warranties.push(warranty);
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.WARRANTIES, JSON.stringify(warranties));
};

export const deleteWarranty = (warrantyId: string): void => {
  const warranties = getWarranties().filter(w => w.id !== warrantyId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.WARRANTIES, JSON.stringify(warranties));
};

// Document Templates
export const getDocumentTemplates = (): DocumentTemplate[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.DOCUMENT_TEMPLATES);
  if (!stored) {
    return getDefaultTemplates();
  }
  
  try {
    const templates = JSON.parse(stored);
    return templates.map((template: any) => ({
      ...template,
      createdDate: new Date(template.createdDate),
      lastModified: new Date(template.lastModified)
    }));
  } catch {
    return getDefaultTemplates();
  }
};

export const saveDocumentTemplate = (template: DocumentTemplate): void => {
  const templates = getDocumentTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, lastModified: new Date() };
  } else {
    templates.push({ ...template, createdDate: new Date(), lastModified: new Date() });
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.DOCUMENT_TEMPLATES, JSON.stringify(templates));
};

export const deleteDocumentTemplate = (templateId: string): void => {
  const templates = getDocumentTemplates().filter(t => t.id !== templateId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.DOCUMENT_TEMPLATES, JSON.stringify(templates));
};

// Change Orders
export const getChangeOrders = (): ChangeOrder[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.CHANGE_ORDERS);
  if (!stored) return [];
  
  try {
    const orders = JSON.parse(stored);
    return orders.map((order: any) => ({
      ...order,
      date: new Date(order.date),
      approvedDate: order.approvedDate ? new Date(order.approvedDate) : undefined,
      attachments: order.attachments ? order.attachments.map((att: any) => ({
        ...att,
        uploadDate: new Date(att.uploadDate)
      })) : [],
      approvalWorkflow: order.approvalWorkflow ? order.approvalWorkflow.map((step: any) => ({
        ...step,
        approvedDate: step.approvedDate ? new Date(step.approvedDate) : undefined
      })) : []
    }));
  } catch {
    return [];
  }
};

export const saveChangeOrder = (order: ChangeOrder): void => {
  const orders = getChangeOrders();
  const existingIndex = orders.findIndex(o => o.id === order.id);
  
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.push(order);
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.CHANGE_ORDERS, JSON.stringify(orders));
};

export const deleteChangeOrder = (orderId: string): void => {
  const orders = getChangeOrders().filter(o => o.id !== orderId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.CHANGE_ORDERS, JSON.stringify(orders));
};

// Document Attachments
export const getDocumentAttachments = (): DocumentAttachment[] => {
  const stored = localStorage.getItem(DOCUMENT_STORAGE_KEYS.DOCUMENT_ATTACHMENTS);
  if (!stored) return [];
  
  try {
    const attachments = JSON.parse(stored);
    return attachments.map((att: any) => ({
      ...att,
      uploadDate: new Date(att.uploadDate)
    }));
  } catch {
    return [];
  }
};

export const saveDocumentAttachment = (attachment: DocumentAttachment): void => {
  const attachments = getDocumentAttachments();
  const existingIndex = attachments.findIndex(a => a.id === attachment.id);
  
  if (existingIndex >= 0) {
    attachments[existingIndex] = attachment;
  } else {
    attachments.push(attachment);
  }
  
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.DOCUMENT_ATTACHMENTS, JSON.stringify(attachments));
};

export const deleteDocumentAttachment = (attachmentId: string): void => {
  const attachments = getDocumentAttachments().filter(a => a.id !== attachmentId);
  localStorage.setItem(DOCUMENT_STORAGE_KEYS.DOCUMENT_ATTACHMENTS, JSON.stringify(attachments));
};

// Default Templates
const getDefaultTemplates = (): DocumentTemplate[] => {
  return [
    {
      id: 'kitchen-terms',
      name: 'Kitchen Renovation Terms',
      type: 'terms_conditions',
      projectType: 'kitchen',
      content: `TERMS AND CONDITIONS - KITCHEN RENOVATION

1. SCOPE OF WORK
The contractor agrees to provide all labor, materials, and services necessary for the kitchen renovation as specified in the attached plans and specifications.

2. PAYMENT TERMS
- {{deposit_percentage}}% deposit due upon signing
- Progress payments as work is completed
- Final payment due upon completion and client approval

3. TIMELINE
Work will commence on {{start_date}} and is estimated to be completed by {{completion_date}}.

4. CHANGE ORDERS
Any changes to the original scope of work must be documented in writing and signed by both parties.

5. WARRANTY
All work is warranted for {{warranty_period}} months from completion date.

6. PERMITS
Contractor will obtain all necessary permits at client's expense.

By signing below, both parties agree to these terms and conditions.`,
      variables: [
        { name: 'deposit_percentage', label: 'Deposit Percentage', type: 'number', required: true, defaultValue: '25' },
        { name: 'start_date', label: 'Start Date', type: 'date', required: true },
        { name: 'completion_date', label: 'Completion Date', type: 'date', required: true },
        { name: 'warranty_period', label: 'Warranty Period (months)', type: 'number', required: true, defaultValue: '12' }
      ],
      isDefault: true,
      createdDate: new Date(),
      lastModified: new Date()
    },
    {
      id: 'roofing-warranty',
      name: 'Roofing Warranty Template',
      type: 'warranty',
      projectType: 'roofing',
      content: `ROOFING WARRANTY CERTIFICATE

Contractor: {{contractor_name}}
License #: {{license_number}}

Property Owner: {{client_name}}
Property Address: {{property_address}}

WARRANTY COVERAGE:
This warranty covers all roofing work completed on {{completion_date}} for a period of {{warranty_years}} years.

WHAT IS COVERED:
- Workmanship defects
- Material defects (as per manufacturer warranty)
- Leaks due to installation errors

WHAT IS NOT COVERED:
- Damage from severe weather events
- Normal wear and tear
- Damage from other trades or homeowner modifications

This warranty is transferable to new property owners with written notice.

For warranty claims, contact: {{contractor_phone}}`,
      variables: [
        { name: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
        { name: 'license_number', label: 'License Number', type: 'text', required: true },
        { name: 'client_name', label: 'Client Name', type: 'text', required: true },
        { name: 'property_address', label: 'Property Address', type: 'text', required: true },
        { name: 'completion_date', label: 'Completion Date', type: 'date', required: true },
        { name: 'warranty_years', label: 'Warranty Period (years)', type: 'number', required: true, defaultValue: '5' },
        { name: 'contractor_phone', label: 'Contractor Phone', type: 'text', required: true }
      ],
      isDefault: true,
      createdDate: new Date(),
      lastModified: new Date()
    },
    {
      id: 'change-order-template',
      name: 'Standard Change Order',
      type: 'change_order',
      content: `CHANGE ORDER #{{change_order_number}}

Project: {{project_name}}
Date: {{date}}
Client: {{client_name}}
Contractor: {{contractor_name}}

DESCRIPTION OF CHANGE:
{{change_description}}

REASON FOR CHANGE:
{{change_reason}}

COST IMPACT:
Original Contract Amount: {{original_amount}}
This Change Order: {{change_amount}}
New Contract Total: {{new_total}}

TIME IMPACT:
{{time_impact}}

APPROVAL:
By signing below, the client approves this change order and agrees to the additional cost and time adjustments.

Client Signature: _________________ Date: _________
Contractor Signature: _____________ Date: _________`,
      variables: [
        { name: 'change_order_number', label: 'Change Order Number', type: 'text', required: true },
        { name: 'project_name', label: 'Project Name', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'client_name', label: 'Client Name', type: 'text', required: true },
        { name: 'contractor_name', label: 'Contractor Name', type: 'text', required: true },
        { name: 'change_description', label: 'Change Description', type: 'text', required: true },
        { name: 'change_reason', label: 'Reason for Change', type: 'text', required: false },
        { name: 'original_amount', label: 'Original Contract Amount', type: 'number', required: true },
        { name: 'change_amount', label: 'Change Amount', type: 'number', required: true },
        { name: 'new_total', label: 'New Contract Total', type: 'number', required: true },
        { name: 'time_impact', label: 'Time Impact', type: 'text', required: false }
      ],
      isDefault: true,
      createdDate: new Date(),
      lastModified: new Date()
    }
  ];
};

// Template Processing
export const processTemplate = (template: DocumentTemplate, variables: Record<string, string>): string => {
  let processedContent = template.content;
  
  template.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const placeholder = `{{${variable.name}}}`;
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return processedContent;
};

// Generate document from template
export const generateDocumentFromTemplate = (
  templateId: string, 
  variables: Record<string, string>
): string => {
  const templates = getDocumentTemplates();
  const template = templates.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  return processTemplate(template, variables);
};