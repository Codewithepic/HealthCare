import React, { useEffect } from 'react';
import { useCivicAuthPermissions } from '@/hooks/useCivicAuthPermissions';
import { PermissionsProvider } from '@/hooks/usePermissions';
import { useWalletAddress } from '@/hooks/useWalletAddress';

interface PermissionsManagerProps {
  children: React.ReactNode;
}

/**
 * Component that manages permissions required by the application
 * This helps handle permissions policy restrictions by requesting
 * permissions explicitly before they are needed and provides role-based
 * access control through the PermissionsProvider
 */
export const PermissionsManager: React.FC<PermissionsManagerProps> = ({ children }) => {
  // Use the hook to request permissions
  const { permissionsRequested, permissionStates } = useCivicAuthPermissions();
  const { walletAddress } = useWalletAddress();
  
  // Log permission states when they change
  useEffect(() => {
    if (permissionsRequested) {
      console.log('Civic permissions states:', permissionStates);
    }
  }, [permissionsRequested, permissionStates]);
  
  return (
    <PermissionsProvider walletAddress={walletAddress}>
      {children}
    </PermissionsProvider>
  );
};

export default PermissionsManager;
