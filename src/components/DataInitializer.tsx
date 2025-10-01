'use client';

import { useDataInitialization } from '@/hooks/useDataInitialization';

/**
 * Component that initializes application data on mount
 * This component doesn't render anything but handles data loading
 */
export default function DataInitializer() {
  useDataInitialization();
  
  // This component doesn't render anything
  return null;
}
