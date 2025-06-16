export interface ContractorInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  licenseNumber: string;
  website?: string;
  taxId?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  defaultPaymentTerms?: string;
  logoUrl?: string;
  // Advanced calculation settings
  defaultMaterialMarkup?: number;
  defaultLaborMarkup?: number;
  defaultMaterialTaxRate?: number;
  defaultLaborTaxRate?: number;
  defaultEquipmentTaxRate?: number;
  // Digital signature
  digitalSignature?: string;
  signatureDate?: Date;
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  createdAt: Date;
  // Digital signature capability
  digitalSignature?: string;
  signatureDate?: Date;
}

export interface LineItem {
  id: string;
  description: string;
  category: 'material' | 'labor' | 'equipment' | 'permit' | 'electrical' | 'plumbing' | 'framing' | 'landscaping' | 'other';
  quantity: number;
  unit: string;
  rate: number;
  cost?: number; // Base cost before markup
  markup?: number; // Markup percentage
  taxRate?: number; // Custom tax rate for this item
  total: number;
  notes?: string;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  appliesTo: 'subtotal' | 'total' | 'category';
  category?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  reference?: string;
  notes?: string;
}

export interface ChangeOrder {
  id: string;
  number: string;
  date: Date;
  description: string;
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvedDate?: Date;
  clientSignature?: string;
  contractorSignature?: string;
  reason?: string;
  attachments?: DocumentAttachment[];
  approvalWorkflow?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  stepName: string;
  approverName: string;
  approverEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedDate?: Date;
  comments?: string;
  signature?: string;
}

export interface ProgressBilling {
  id: string;
  phase: string;
  description: string;
  percentage: number;
  amount: number;
  dueDate?: Date;
  status: 'pending' | 'billed' | 'paid';
  billedDate?: Date;
  paidDate?: Date;
  invoiceId?: string;
}

export interface TaxBreakdown {
  materialTax: number;
  laborTax: number;
  equipmentTax: number;
  otherTax: number;
  totalTax: number;
}

export interface CategoryTotals {
  material: number;
  labor: number;
  equipment: number;
  other: number;
}

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'before' | 'progress' | 'after' | 'materials' | 'other';
  timestamp?: Date;
  gpsLocation?: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'video';
  url: string;
  size: number;
  uploadDate: Date;
  category: 'contract' | 'permit' | 'inspection' | 'photo' | 'warranty' | 'other';
}

export interface DigitalSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  signatureData: string; // Base64 encoded signature
  signatureDate: Date;
  ipAddress?: string;
  deviceInfo?: string;
  documentHash?: string;
}

export interface LienWaiver {
  id: string;
  type: 'conditional_partial' | 'unconditional_partial' | 'conditional_final' | 'unconditional_final';
  projectId: string;
  contractorName: string;
  propertyOwner: string;
  propertyAddress: string;
  throughDate: Date;
  amountPaid: number;
  amountUnpaid?: number;
  signature?: DigitalSignature;
  notarized: boolean;
  createdDate: Date;
  effectiveDate: Date;
}

export interface EquipmentRental {
  id: string;
  equipmentName: string;
  equipmentType: string;
  supplier: string;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalCost: number;
  deliveryFee?: number;
  pickupFee?: number;
  damageDeposit?: number;
  status: 'reserved' | 'delivered' | 'in_use' | 'returned' | 'damaged';
  projectId?: string;
  notes?: string;
  attachments?: DocumentAttachment[];
}

export interface WarrantyDocument {
  id: string;
  projectId: string;
  workType: string;
  warrantyPeriod: number; // in months
  warrantyStartDate: Date;
  warrantyEndDate: Date;
  coverageDescription: string;
  exclusions?: string[];
  terms: string;
  contractorSignature?: DigitalSignature;
  clientSignature?: DigitalSignature;
  createdDate: Date;
  status: 'active' | 'expired' | 'claimed' | 'void';
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'terms_conditions' | 'warranty' | 'contract' | 'change_order' | 'lien_waiver';
  projectType?: string; // kitchen, bathroom, roofing, etc.
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  createdDate: Date;
  lastModified: Date;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: string;
}

export interface TemplateSettings {
  id: string;
  name: string;
  type: 'modern' | 'classic' | 'minimal' | 'construction';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  headerStyle: 'standard' | 'centered' | 'split' | 'minimal';
  footerStyle: 'standard' | 'minimal' | 'detailed' | 'none';
  showLogo: boolean;
  showProjectPhotos: boolean;
  showDetailedBreakdown: boolean;
  showDigitalSignature: boolean;
  fontFamily: 'Arial' | 'Times' | 'Helvetica' | 'Georgia';
  fontSize: 'small' | 'medium' | 'large';
  customHeader?: string;
  customFooter?: string;
}

// Construction Industry-Specific Types

export interface MaterialItem {
  id: string;
  name: string;
  category: 'lumber' | 'concrete' | 'drywall' | 'roofing' | 'electrical' | 'plumbing' | 'hardware' | 'insulation' | 'flooring' | 'paint' | 'other';
  unit: string;
  currentPrice: number;
  supplier?: string;
  sku?: string;
  description?: string;
  lastUpdated: Date;
  priceHistory: PriceHistory[];
}

export interface PriceHistory {
  date: Date;
  price: number;
  supplier?: string;
}

export interface LaborRate {
  id: string;
  trade: 'general' | 'carpenter' | 'electrician' | 'plumber' | 'hvac' | 'roofer' | 'painter' | 'flooring' | 'drywall' | 'concrete' | 'landscaping' | 'other';
  skillLevel: 'apprentice' | 'journeyman' | 'master' | 'foreman';
  hourlyRate: number;
  region: string;
  union: boolean;
  benefits?: number; // Additional cost for benefits
  lastUpdated: Date;
}

export interface Permit {
  id: string;
  projectId: string;
  type: 'building' | 'electrical' | 'plumbing' | 'mechanical' | 'demolition' | 'excavation' | 'other';
  number: string;
  description: string;
  applicationDate: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  cost: number;
  status: 'applied' | 'approved' | 'expired' | 'rejected';
  authority: string;
  notes?: string;
  documents: PermitDocument[];
}

export interface PermitDocument {
  id: string;
  name: string;
  type: 'application' | 'approval' | 'inspection' | 'certificate' | 'other';
  url?: string;
  uploadDate: Date;
}

export interface Inspection {
  id: string;
  permitId: string;
  projectId: string;
  type: 'foundation' | 'framing' | 'electrical' | 'plumbing' | 'insulation' | 'drywall' | 'final' | 'other';
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'passed' | 'failed' | 'rescheduled' | 'cancelled';
  inspector: string;
  notes?: string;
  deficiencies: string[];
  nextInspection?: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  company: string;
  trade: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  location?: string;
  licenseNumber?: string;
  insuranceExpiry?: Date;
  rating: number; // 1-5 stars
  specialties: string[];
  rates: SubcontractorRate[];
  status: 'available' | 'busy' | 'unavailable';
  notes?: string;
  createdAt: Date;
}

export interface SubcontractorRate {
  id: string;
  description: string;
  unit: string;
  rate: number;
  minimumCharge?: number;
  effectiveDate: Date;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  milestones: ProjectMilestone[];
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: 'planning' | 'active' | 'delayed' | 'completed' | 'cancelled';
  weatherDelays: WeatherDelay[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[]; // IDs of prerequisite milestones
  assignedTo?: string; // Subcontractor ID
  assignedSubcontractors?: string[]; // Multiple subcontractors
  billingPercentage?: number; // For progress billing
  billingAmount?: number; // Fixed billing amount
  notes?: string;
}

export interface WeatherDelay {
  id: string;
  date: Date;
  weatherType: 'rain' | 'snow' | 'extreme_heat' | 'extreme_cold' | 'wind' | 'other';
  description: string;
  daysDelayed: number;
  impact: 'minor' | 'moderate' | 'major';
  affectedMilestones: string[];
  additionalCost?: number; // Additional costs due to delay
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  address: string;
  clientId: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  startDate: Date;
  endDate: Date;
  budget: number;
  actualCost?: number;
  permits: Permit[];
  inspections: Inspection[];
  timeline?: ProjectTimeline;
  assignedSubcontractors: string[];
  photos: ProjectPhoto[];
  attachments: DocumentAttachment[];
  lienWaivers: LienWaiver[];
  equipmentRentals: EquipmentRental[];
  warranties: WarrantyDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  type: 'invoice' | 'quote';
  number: string;
  date: Date;
  dueDate?: Date;
  expiryDate?: Date; // For quotes
  contractorInfo: ContractorInfo;
  client: Client;
  projectId?: string; // Link to project
  projectTitle: string;
  projectDescription?: string;
  projectAddress?: string;
  projectPhotos?: ProjectPhoto[];
  lineItems: LineItem[];
  
  // Advanced calculations
  subtotal: number;
  materialSubtotal: number;
  laborSubtotal: number;
  equipmentSubtotal: number;
  otherSubtotal: number;
  
  // Tax breakdown
  taxBreakdown: TaxBreakdown;
  taxAmount: number;
  
  // Discounts
  discounts: Discount[];
  discountAmount: number;
  
  // Final totals
  total: number;
  
  // Payment tracking
  depositAmount?: number;
  depositPaid?: boolean;
  depositDate?: Date;
  payments: Payment[];
  balanceDue: number;
  
  // Change orders
  changeOrders: ChangeOrder[];
  changeOrderTotal: number;
  
  // Progress billing
  progressBilling?: ProgressBilling[];
  isProgressBilling: boolean;
  
  // Template settings
  templateSettings?: TemplateSettings;
  
  // Document enhancements
  terms?: string;
  notes?: string;
  attachments?: DocumentAttachment[];
  digitalSignatures?: DigitalSignature[];
  lienWaivers?: LienWaiver[];
  warranties?: WarrantyDocument[];
  
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'paid' | 'overdue' | 'converted' | 'partial_paid' | 'signed';
  originalQuoteId?: string; // For invoices converted from quotes
  convertedInvoiceId?: string; // For quotes that have been converted
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceFormData {
  type: 'invoice' | 'quote';
  number: string;
  date: string;
  dueDate: string;
  expiryDate: string;
  contractorInfo: ContractorInfo;
  clientId: string;
  projectId?: string;
  projectTitle: string;
  projectDescription: string;
  projectAddress: string;
  projectPhotos: ProjectPhoto[];
  lineItems: LineItem[];
  
  // Advanced settings
  materialTaxRate: number;
  laborTaxRate: number;
  equipmentTaxRate: number;
  otherTaxRate: number;
  
  // Discounts
  discounts: Discount[];
  
  // Deposit
  depositAmount: number;
  depositPercentage: number;
  
  // Progress billing
  isProgressBilling: boolean;
  progressPhases: ProgressBilling[];
  
  // Template settings
  templateSettings: TemplateSettings;
  
  terms: string;
  notes: string;
  attachments: DocumentAttachment[];
}