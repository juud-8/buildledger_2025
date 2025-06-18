import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define a type for our environment variables
interface SupabaseEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Log the environment variables (for debugging purposes)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

// Check if environment variables are loaded
if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL is not defined.');
  throw new Error('VITE_SUPABASE_URL is not defined. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_ANON_KEY is not defined.');
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.');
}

// Initialize Supabase client
let supabase: SupabaseClient;

try {
  supabase = createClient<SupabaseEnv>(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client initialized successfully.');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw new Error('Failed to initialize Supabase client.');
}

// Export the client as both named and default
export { supabase };
export default supabase;
