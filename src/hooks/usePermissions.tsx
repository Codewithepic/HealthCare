import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { validateRoleAttestation } from '@/lib/verificationService';

// Re-export HealthcareRole type so consumers don't need to import from verificationService
export type HealthcareRole = 
  | "PATIENT" 
  | "PROVIDER" 
  | "RESEARCHER" 
  | "ADMIN";

export interface TokenGatedFeature {
  id: string;
  name: string;
  requiredRoles: HealthcareRole[];
  description: string;
}

interface PermissionsContextType {
  currentRole: HealthcareRole | null;
  attestationId: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  lastVerified: string | null;
  expiresAt: string | null;
  canAccessFeature: (featureId: string) => boolean;
  hasRole: (role: HealthcareRole) => boolean;
  refreshPermissions: () => Promise<void>;
  availableFeatures: TokenGatedFeature[];
}

// Feature definitions with required roles
const TOKEN_GATED_FEATURES: TokenGatedFeature[] = [
  {
    id: 'medical_records_view',
    name: 'View Medical Records',
    requiredRoles: ['PATIENT', 'PROVIDER', 'ADMIN'],
    description: 'Access to view medical records'
  },
  {
    id: 'medical_records_edit',
    name: 'Edit Medical Records',
    requiredRoles: ['PROVIDER', 'ADMIN'],
    description: 'Ability to modify medical records'
  },
  {
    id: 'provider_management',
    name: 'Provider Management',
    requiredRoles: ['ADMIN'],
    description: 'Manage healthcare providers and their credentials'
  },
  {
    id: 'research_data_access',
    name: 'Research Data Access',
    requiredRoles: ['RESEARCHER', 'ADMIN'],
    description: 'Access to anonymized research datasets'
  },
  {
    id: 'user_management',
    name: 'User Management',
    requiredRoles: ['ADMIN'],
    description: 'Manage user accounts and permissions'
  },
  {
    id: 'patient_data_view',
    name: 'Patient Data Viewing',
    requiredRoles: ['PATIENT', 'PROVIDER', 'ADMIN'],
    description: 'View patient medical data'
  },
  {
    id: 'patient_data_edit',
    name: 'Patient Data Editing',
    requiredRoles: ['PROVIDER', 'ADMIN'],
    description: 'Edit patient medical data'
  }
];

// Create the context
export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Provider component
export function PermissionsProvider({ children, walletAddress }: { children: ReactNode, walletAddress?: string | null }) {
  // State for permissions data
  const [currentRole, setCurrentRole] = useState<HealthcareRole | null>(null);
  const [attestationId, setAttestationId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [lastVerified, setLastVerified] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Load permissions from localStorage on startup
  useEffect(() => {
    const loadPermissions = async () => {
      if (!walletAddress) {
        resetPermissionState();
        return;
      }

      try {
        // Check for stored verification
        const storedVerification = localStorage.getItem(`healthcare_verification_${walletAddress}`);
        if (!storedVerification) {
          resetPermissionState();
          return;
        }
        
        const verification = JSON.parse(storedVerification);
        
        // If attestation exists, validate it
        if (verification.attestationId) {
          // Check attestation validity on the blockchain (simulated)
          const isValid = await validateRoleAttestation(verification.attestationId);
          
          if (!isValid) {
            console.log('Attestation invalid or expired');
            resetPermissionState();
            return;
          }
          
          // If attestation is valid, set the permission state
          setCurrentRole(verification.role);
          setAttestationId(verification.attestationId);
          setIsVerified(true);
          setLastVerified(verification.verifiedAt || new Date().toISOString());
          setExpiresAt(verification.expiresAt);
        } else if (verification.role) {
          // Legacy storage without attestation - still set role but mark unverified
          setCurrentRole(verification.role);
          setIsVerified(false);
        } else {
          resetPermissionState();
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        resetPermissionState();
      }
    };
    
    loadPermissions();
  }, [walletAddress]);
  
  // Reset permission state helper
  const resetPermissionState = () => {
    setCurrentRole(null);
    setAttestationId(null);
    setIsVerified(false);
    setLastVerified(null);
    setExpiresAt(null);
  };
  
  // Function to refresh permissions
  const refreshPermissions = async () => {
    if (!walletAddress) return;
    
    try {
      const storedVerification = localStorage.getItem(`healthcare_verification_${walletAddress}`);
      if (!storedVerification) return;
      
      const verification = JSON.parse(storedVerification);
      
      // Re-validate the attestation
      if (verification.attestationId) {
        const isValid = await validateRoleAttestation(verification.attestationId);
        
        if (!isValid) {
          resetPermissionState();
          return;
        }
        
        setCurrentRole(verification.role);
        setAttestationId(verification.attestationId);
        setIsVerified(true);
        setLastVerified(new Date().toISOString());
        setExpiresAt(verification.expiresAt);
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  };
  
  // Check if user has a specific role
  const hasRole = (role: HealthcareRole): boolean => {
    return currentRole === role;
  };
  
  // Check if user can access a specific feature
  const canAccessFeature = (featureId: string): boolean => {
    if (!currentRole || !isVerified) return false;
    
    const feature = TOKEN_GATED_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    
    return feature.requiredRoles.includes(currentRole);
  };
  
  // Filter available features based on current role
  const availableFeatures = TOKEN_GATED_FEATURES.filter(feature => 
    currentRole && isVerified && feature.requiredRoles.includes(currentRole)
  );
  
  // The context value
  const contextValue: PermissionsContextType = {
    currentRole,
    attestationId,
    isAuthenticated: !!walletAddress,
    isVerified,
    lastVerified,
    expiresAt,
    canAccessFeature,
    hasRole,
    refreshPermissions,
    availableFeatures
  };
  
  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Custom hook to use the permissions context
export function usePermissions() {
  const context = useContext(PermissionsContext);
  
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  
  return context;
}
