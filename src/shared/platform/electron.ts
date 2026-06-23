import type { PlatformAPI } from './types';

export const electronPlatform: PlatformAPI = {
  ...window.api,
  capabilities: { pdfExport: true, nativeSaveDialog: true },
};
