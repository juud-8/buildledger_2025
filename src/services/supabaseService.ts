import supabase from '../lib/supabase'; // Using the consolidated client
import { User } from '@supabase/supabase-js';
import { BaseRecord } from '../types/supabase';

/**
 * Base class for interacting with a Supabase table.
 */
export class SupabaseService<T extends BaseRecord> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    console.log(`SupabaseService initialized for table: ${this.tableName}`);
  }

  /**
   * Get all records from the table.
   */
  async getAll(): Promise<T[]> {
    console.log(`Fetching all records from ${this.tableName}`);
    const { data, error } = await supabase.from(this.tableName).select('*');
    if (error) {
      console.error(`Error fetching all records from ${this.tableName}:`, error.message);
      throw new Error(`Failed to fetch records from ${this.tableName}: ${error.message}`);
    }
    console.log(`Successfully fetched ${data?.length || 0} records from ${this.tableName}`);
    return data as T[] || [];
  }

  /**
   * Get a record by its ID.
   */
  async getById(id: string): Promise<T | null> {
    console.log(`Fetching record with id ${id} from ${this.tableName}`);
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error code for "No rows found"
        console.warn(`No record found with id ${id} in ${this.tableName}.`);
        return null;
      }
      console.error(`Error fetching record ${id} from ${this.tableName}:`, error.message);
      throw new Error(`Failed to fetch record ${id} from ${this.tableName}: ${error.message}`);
    }
    console.log(`Successfully fetched record ${id} from ${this.tableName}`);
    return data as T | null;
  }

  /**
   * Create a new record.
   */
  async create(itemData: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T> {
    console.log(`Creating new record in ${this.tableName} with data:`, itemData);
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(itemData as any) // Cast to any for insert, Supabase types will handle it
      .select()
      .single();

    if (error) {
      console.error(`Error creating record in ${this.tableName}:`, error.message);
      throw new Error(`Failed to create record in ${this.tableName}: ${error.message}`);
    }
    if (!data) {
      console.error(`No data returned after creating record in ${this.tableName}`);
      throw new Error(`Failed to create record in ${this.tableName}: No data returned.`);
    }
    console.log(`Successfully created record in ${this.tableName}:`, data);
    return data as T;
  }

  /**
   * Update an existing record by ID.
   */
  async update(id: string, itemData: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T | null> {
    console.log(`Updating record ${id} in ${this.tableName} with data:`, itemData);
    const { data, error } = await supabase
      .from(this.tableName)
      .update(itemData as any) // Cast to any for update
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating record ${id} in ${this.tableName}:`, error.message);
      throw new Error(`Failed to update record ${id} in ${this.tableName}: ${error.message}`);
    }
    if (!data) {
        console.warn(`No data returned after attempting to update record ${id}. It might not exist or no changes were made.`);
        return null;
    }
    console.log(`Successfully updated record ${id} in ${this.tableName}:`, data);
    return data as T;
  }

  /**
   * Delete a record by ID.
   */
  async delete(id: string): Promise<void> {
    console.log(`Deleting record ${id} from ${this.tableName}`);
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting record ${id} from ${this.tableName}:`, error.message);
      throw new Error(`Failed to delete record ${id} from ${this.tableName}: ${error.message}`);
    }
    console.log(`Successfully deleted record ${id} from ${this.tableName}`);
  }
}

/**
 * Get the current authenticated Supabase user.
 */
export async function getCurrentSupabaseUser(): Promise<User | null> {
  console.log('Attempting to get current Supabase user session...');
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting user session:', error.message);
    // Depending on the error, you might want to throw or handle differently
    // For now, returning null as if no user is authenticated
    return null;
  }

  if (!session) {
    console.log('No active Supabase session found.');
    return null;
  }

  console.log('Active Supabase session found for user:', session.user.id);
  return session.user;
}

/**
 * Get the current authenticated Supabase user, or throw an error if not authenticated.
 */
export async function requireSupabaseAuth(): Promise<User> {
  console.log('Requiring Supabase authentication...');
  const user = await getCurrentSupabaseUser();
  if (!user) {
    console.error('Authentication required, but no user is logged in.');
    throw new Error('Authentication required. Please log in.');
  }
  console.log('User is authenticated:', user.id);
  return user;
}

// Example of how to extend the service (will be done in separate files later)
/*
import { Client } from '../types'; // Assuming Client type exists

interface ClientRecord extends BaseRecord, Client {}

export class ClientService extends SupabaseService<ClientRecord> {
  constructor() {
    super('clients'); // 'clients' is the Supabase table name
  }

  // You can add client-specific methods here if needed
  // async getClientsWithRecentActivity(): Promise<ClientRecord[]> {
  //   // ... custom logic
  // }
}
*/
