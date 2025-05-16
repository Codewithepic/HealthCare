import React from 'react';
import { usePermissions, HealthcareRole } from '@/hooks/usePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LockClosedIcon, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoleBasedAccessProps {
  /**
   * The roles that are allowed to access the content
   */
  allowedRoles: HealthcareRole[];
  
  /**
   * Alternative content to show when access is denied
   */
  fallback?: React.ReactNode;
  
  /**
   * Whether to show an alert when access is denied
   */
  showAlert?: boolean;
  
  /**
   * The children to render when access is granted
   */
  children: React.ReactNode;
  
  /**
   * Optional feature ID for more granular access control
   */
  featureId?: string;
}

/**
 * A component that only renders its children if the current user has one of the allowed roles
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  allowedRoles,
  fallback,
  showAlert = true,
  children,
  featureId
}) => {
  const { currentRole, isVerified, isAuthenticated, canAccessFeature } = usePermissions();
  
  // If a specific feature ID is provided, check for feature access
  if (featureId && isVerified) {
    const hasAccess = canAccessFeature(featureId);
    if (hasAccess) {
      return <>{children}</>;
    }
  }
  // Otherwise, check if the user has one of the allowed roles
  else if (currentRole && isVerified && allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }
  
  // If there's a fallback, show it instead
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Otherwise, show an access denied message
  if (showAlert) {
    return (
      <Alert variant="destructive" className="my-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            {!isAuthenticated 
              ? "You must be signed in to access this content." 
              : !isVerified 
                ? "Your healthcare identity must be verified to access this content." 
                : `This content is only available to ${allowedRoles.join(', ').toLowerCase()} roles.`}
          </p>
          {!isVerified && isAuthenticated && (
            <div className="mt-2">
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a href="/verification">Verify Your Identity</a>
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // If no alert or fallback, render nothing
  return null;
};

/**
 * A component that only renders its children if the current user is a patient
 */
export const PatientOnly: React.FC<Omit<RoleBasedAccessProps, 'allowedRoles'>> = (props) => {
  return <RoleBasedAccess allowedRoles={['PATIENT']} {...props} />;
};

/**
 * A component that only renders its children if the current user is a healthcare provider
 */
export const ProviderOnly: React.FC<Omit<RoleBasedAccessProps, 'allowedRoles'>> = (props) => {
  return <RoleBasedAccess allowedRoles={['PROVIDER']} {...props} />;
};

/**
 * A component that only renders its children if the current user is a researcher
 */
export const ResearcherOnly: React.FC<Omit<RoleBasedAccessProps, 'allowedRoles'>> = (props) => {
  return <RoleBasedAccess allowedRoles={['RESEARCHER']} {...props} />;
};

/**
 * A component that only renders its children if the current user is an administrator
 */
export const AdminOnly: React.FC<Omit<RoleBasedAccessProps, 'allowedRoles'>> = (props) => {
  return <RoleBasedAccess allowedRoles={['ADMIN']} {...props} />;
};

/**
 * A component that only renders its children if the current user is a patient or provider
 */
export const PatientOrProviderOnly: React.FC<Omit<RoleBasedAccessProps, 'allowedRoles'>> = (props) => {
  return <RoleBasedAccess allowedRoles={['PATIENT', 'PROVIDER']} {...props} />;
};

export default RoleBasedAccess;
