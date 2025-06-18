// src/types/supabase.ts

/**
 * Base interface for Supabase table records.
 * Assumes standard 'id', 'created_at', and 'updated_at' columns.
 */
export interface BaseRecord {
  id: string; // Typically a UUID string
  created_at: string; // ISO 8601 timestamp string
  updated_at: string; // ISO 8601 timestamp string
}

/**
 * Placeholder interface for a Client record in Supabase.
 * Extends BaseRecord and can include fields from the existing Client type.
 */
export interface ClientRecord extends BaseRecord {
  // Fields from existing src/types/index.ts Client type
  name: string;
  contactPerson?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  // Add any other client-specific fields that are in your Supabase table
  // e.g., user_id?: string; // If clients are linked to users
}

/**
 * Placeholder interface for an Invoice record in Supabase.
 * Extends BaseRecord and can include fields from the existing Invoice type.
 */
export interface InvoiceRecord extends BaseRecord {
  // Fields from existing src/types/index.ts Invoice type (or their DB representations)
  invoice_number: string; // Example: 'number' field from Invoice type might be 'invoice_number' in DB
  client_id: string; // Foreign key to ClientRecord.id
  project_title: string;
  total_amount: number; // Example: 'total' field from Invoice type
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'; // Match your DB enum or string types
  due_date?: string; // ISO 8601 timestamp string
  // Add any other invoice-specific fields that are in your Supabase table
  // e.g., line_items_json?: string; // If line items are stored as JSON
  // contractor_id?: string;
}

/**
 * Placeholder interface for a User Profile record in Supabase.
 * Often linked to Supabase Auth users.
 */
export interface UserProfileRecord extends BaseRecord {
  user_id: string; // Foreign key to auth.users.id
  full_name?: string;
  company_name?: string;
  // Add any other profile-specific fields
}

// Add more placeholder interfaces for other tables as needed for your application
// export interface PaymentRecord extends BaseRecord { ... }
// export interface ProjectRecord extends BaseRecord { ... }

// It's good practice to also define types for relationships if you'll be fetching joined data
// export interface InvoiceWithClientRecord extends InvoiceRecord {
//   clients: ClientRecord | null; // Supabase often returns related records as an object or null
// }
