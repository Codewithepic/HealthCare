# Role-Based Access Control Guide

This guide explains how to use the role-based access control (RBAC) system in the Healthcare Identity Platform.

## Overview

The Healthcare Identity Platform uses blockchain attestations to verify healthcare roles and control access to features based on these verified roles.

## Available Roles

The platform supports four healthcare roles:

- **Patient** - Individuals seeking healthcare services
- **Provider** - Healthcare professionals providing care
- **Researcher** - Individuals conducting medical research
- **Admin** - System administrators

## Verification Process

Each role has a specific verification workflow:

1. **Patient Verification**
   - Basic identity verification
   - Optional insurance information validation
   - Valid for 1 year

2. **Provider Verification**
   - Medical license verification
   - Institutional affiliation check
   - Specialty credential validation
   - Valid for 2 years

3. **Researcher Verification**
   - Academic/research institution verification
   - Research credentials validation
   - IRB approval confirmation
   - Valid for 1 year

4. **Admin Verification**
   - Enhanced identity verification
   - Multi-factor authentication
   - System administrator credentials
   - Valid for 6 months (shorter for security reasons)

## Role-Based Access Components

### RoleBasedAccess

The main component that controls access based on role:

```tsx
import { RoleBasedAccess } from '@/components/access/RoleBasedAccess';

// Example usage
<RoleBasedAccess allowedRoles={['PATIENT', 'PROVIDER']}>
  <p>This content is visible to patients and providers.</p>
</RoleBasedAccess>

// With feature ID
<RoleBasedAccess 
  allowedRoles={['PROVIDER']} 
  featureId="medical_records_edit"
>
  <p>This content is only visible to providers with edit permissions.</p>
</RoleBasedAccess>

// With fallback content
<RoleBasedAccess 
  allowedRoles={['ADMIN']}
  fallback={<p>You need admin privileges to view this content.</p>}
>
  <p>This content is only visible to admins.</p>
</RoleBasedAccess>
```

### Role-Specific Components

The platform provides role-specific access control components:

```tsx
import { 
  PatientOnly, 
  ProviderOnly, 
  ResearcherOnly, 
  AdminOnly,
  PatientOrProviderOnly
} from '@/components/access/RoleBasedAccess';

// Examples
<PatientOnly>
  <p>Only patients can see this.</p>
</PatientOnly>

<ProviderOnly>
  <p>Only providers can see this.</p>
</ProviderOnly>

<ResearcherOnly>
  <p>Only researchers can see this.</p>
</ResearcherOnly>

<AdminOnly>
  <p>Only admins can see this.</p>
</AdminOnly>

<PatientOrProviderOnly>
  <p>Patients and providers can see this.</p>
</PatientOrProviderOnly>
```

## Working with Permissions

### Permissions Provider

The permissions system is managed through a context provider:

```tsx
import { PermissionsProvider } from '@/hooks/usePermissions';

// Wrap your application with the provider
<PermissionsProvider walletAddress={walletAddress}>
  <YourApp />
</PermissionsProvider>
```

### usePermissions Hook

Access permission-related functionality with the usePermissions hook:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { 
    currentRole,
    attestationId,
    isAuthenticated,
    isVerified,
    lastVerified,
    expiresAt,
    canAccessFeature,
    hasRole,
    refreshPermissions,
    availableFeatures
  } = usePermissions();

  // Check if user can access a specific feature
  const canEditRecords = canAccessFeature('medical_records_edit');

  // Check if user has a specific role
  const isProvider = hasRole('PROVIDER');

  return (
    <div>
      {isVerified ? (
        <p>You are verified as: {currentRole}</p>
      ) : (
        <p>Please verify your healthcare role</p>
      )}

      {canEditRecords && (
        <button>Edit Medical Records</button>
      )}
    </div>
  );
}
```

## Token-Gated Features

The platform defines token-gated features that are only accessible to users with specific roles:

| Feature ID | Name | Required Roles | Description |
|------------|------|----------------|-------------|
| medical_records_view | View Medical Records | PATIENT, PROVIDER, ADMIN | Access to view medical records |
| medical_records_edit | Edit Medical Records | PROVIDER, ADMIN | Ability to modify medical records |
| provider_management | Provider Management | ADMIN | Manage healthcare providers |
| research_data_access | Research Data Access | RESEARCHER, ADMIN | Access anonymized research data |
| user_management | User Management | ADMIN | Manage user accounts |

## Integration with HealthcareVerification Component

The `HealthcareVerification` component handles the verification process:

```tsx
import HealthcareVerification from '@/components/verification/HealthcareVerification';

// Example usage
<HealthcareVerification 
  userData={userData}
  onVerificationComplete={(verified, role) => {
    if (verified) {
      console.log(`Verified as ${role}`);
    }
  }} 
/>
```

## Blockchain Attestations

Blockchain attestations serve as cryptographic proof of verification:

```typescript
interface VerificationAttestation {
  id: string;
  walletAddress: string;
  role: HealthcareRole;
  issuedAt: string;
  expiresAt: string;
  issuer: string;
  verificationProof: string;
  status: 'active' | 'revoked' | 'expired';
}
```

## Best Practices

1. **Always check permissions** before rendering sensitive content or allowing actions
2. **Use the appropriate access control component** for your use case
3. **Provide fallback content** when access is denied
4. **Refresh permissions** after role changes or when re-verifying
5. **Check expiration dates** on attestations to ensure they're still valid

## Example: Patient Dashboard

The Patient Dashboard is an example of a role-restricted component:

```tsx
import { PatientOnly } from '@/components/access/RoleBasedAccess';

export const PatientDashboard: React.FC = () => {
  return (
    <PatientOnly>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        
        {/* Patient-only content */}
        <div className="grid grid-cols-2 gap-4">
          <MedicalRecordsPanel />
          <AppointmentsPanel />
        </div>
      </div>
    </PatientOnly>
  );
};
```

## Creating Protected Routes

You can protect entire routes using the access control components:

```tsx
import { Navigate } from 'react-router-dom';
import { RoleBasedAccess } from '@/components/access/RoleBasedAccess';

function ProtectedProviderRoute({ children }) {
  return (
    <RoleBasedAccess 
      allowedRoles={['PROVIDER', 'ADMIN']}
      fallback={<Navigate to="/unauthorized" replace />}
    >
      {children}
    </RoleBasedAccess>
  );
}
```

## Troubleshooting

### User Can't Access Content Despite Having the Right Role

1. Check if the user's verification is still valid (not expired)
2. Verify that the attestation exists and is active
3. Try refreshing permissions with `refreshPermissions()`
4. Check browser console for any error messages

### Permissions Not Updating After Verification

1. Make sure `onVerificationComplete` is being called
2. Call `refreshPermissions()` after verification completes
3. Verify that the attestation was properly created in the database

## Conclusion

The role-based access control system provides a secure foundation for protecting sensitive healthcare data while ensuring appropriate access for different user types. By using blockchain attestations, we create a cryptographically verifiable proof of users' healthcare roles.
