import { useState, useEffect } from 'react';
import { requestAllPermissions } from '@/lib/permissionManager';

// This hook pre-requests important permissions for Civic Auth
export function useCivicAuthPermissions() {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [permissionStates, setPermissionStates] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Only request permissions once
    if (!permissionsRequested) {
      const requestPermissions = async () => {
        try {
          const results = await requestAllPermissions();
          setPermissionStates(results);
        } catch (error) {
          console.error('Error requesting permissions:', error);
        } finally {
          setPermissionsRequested(true);
        }
      };
      
      requestPermissions();
    }
  }, [permissionsRequested]);
  
  return { permissionsRequested, permissionStates };
}
