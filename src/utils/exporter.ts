import { exportAllData } from './storage';

/**
 * Build a Blob containing all user data in JSON format.
 */
export const buildExportBlob = (): Blob => {
  const data = exportAllData();
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
};
