import { importData } from './storage';

/**
 * Merge data from a JSON Blob into local storage or Supabase.
 * Currently Supabase integration is not implemented and falls back to local storage.
 */
export const importFromBlob = async (
  blob: Blob,
  supabaseClient?: any
): Promise<boolean> => {
  try {
    const text = await blob.text();
    const data = JSON.parse(text);

    if (supabaseClient && typeof supabaseClient.from === 'function') {
      // Placeholder for Supabase merge logic
      console.warn('Supabase import not implemented; using local storage.');
    }

    return importData(data);
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
};
