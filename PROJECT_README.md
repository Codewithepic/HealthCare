# Healthcare Identity Platform

A blockchain-based healthcare identity verification platform using Civic Auth for secure role-based access control.

![Healthcare Identity Platform](https://example.com/healthcare-identity-logo.svg)

## Overview

Healthcare Identity Platform solves critical challenges in healthcare identity verification and access management through blockchain technology:

- **Secure Identity Verification**: Blockchain-backed identity verification for patients, providers, researchers, and administrators
- **Role-Based Access Control**: Grant appropriate access to healthcare resources based on verified roles
- **Credential Verification**: Verify healthcare credentials with blockchain attestations
- **Patient Data Control**: Give patients control over who can access their medical information

## Key Features

### For Patients

- **Medical Records Management**: View, organize, and share medical history
- **Appointment Management**: Schedule, track, and manage healthcare appointments
- **Care Team Management**: Control which providers have access to your data
- **Research Participation**: Opt into medical research studies with granular consent
- **Security & Privacy**: Blockchain-verified identity with explicit access controls

### For Healthcare Providers

- **Patient Management**: Access authorized patient records
- **Medical Record Creation**: Create and update patient medical records
- **Credential Verification**: Prove medical qualifications with blockchain attestations
- **Appointment Scheduling**: Manage patient appointments and reminders

### For Researchers

- **Anonymized Data Access**: Access approved datasets for research
- **Research Participant Management**: Manage patient enrollment in studies
- **Academic Credential Verification**: Prove research qualifications
- **IRB Compliance**: Track research approval and compliance

### For Administrators

- **User Management**: Administer accounts and permissions
- **System Configuration**: Configure platform settings
- **Security Monitoring**: Track access and verify attestations
- **Credential Verification**: Validate healthcare credentials

## Technical Architecture

### Frontend

- React with TypeScript
- Shadcn UI component library
- Vite build system

### Backend

- Supabase (PostgreSQL database)
- Row-level security policies
- JSONB credential storage

### Blockchain Integration

- Civic Auth for identity verification
- Blockchain attestations for credential verification
- Token-gated features based on verified roles

## Database Schema

### Role Verifications

Stores blockchain-verified role attestations:

```sql
CREATE TABLE role_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attestation_id TEXT NOT NULL,
  attestation_proof TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  credentials JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Healthcare Credentials

Stores verified healthcare credentials:

```sql
CREATE TABLE healthcare_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  credential_data JSONB NOT NULL,
  issuer TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attestation_id TEXT,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Role Access Controls

Defines token-gated features and required roles:

```sql
CREATE TABLE role_access_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name TEXT NOT NULL,
  required_roles TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## How It Works

### 1. Authentication

Users authenticate using Civic Auth, connecting their blockchain wallet to establish their identity.

### 2. Role Verification

Users select their healthcare role (patient, provider, researcher, admin) and go through a role-specific verification process:

- **Patients**: Basic identity verification
- **Providers**: Medical license and institutional affiliation verification
- **Researchers**: Academic/research institution verification
- **Administrators**: Enhanced identity verification with multi-factor authentication

### 3. Blockchain Attestation

Upon successful verification, a blockchain attestation is created as a tamper-proof record of the verification. This attestation includes:
- Role information
- Expiration date
- Cryptographic proof
- Issuer details

### 4. Role-Based Access

The system grants access to features based on the user's verified role, using the blockchain attestation as proof of verification.

### 5. Token-Gated Features

Features are "token-gated" based on the user's role and attestations, ensuring users can only access appropriate functionality.

## Verification Service

The verification service handles role-specific verification workflows:

```typescript
export const verifyHealthcareRole = async (
  walletAddress: string,
  requestedRole: HealthcareRole,
  userData: any
): Promise<VerificationResult> => {
  // Role-specific verification process
  // Creates blockchain attestation
  // Returns verification result
}
```

## Permissions System

The permissions system enforces role-based access control:

```typescript
// Usage example: Only show content to patients
<PatientOnly>
  <PatientDashboard />
</PatientOnly>

// Usage example: Only show content to specific roles
<RoleBasedAccess allowedRoles={['PROVIDER', 'ADMIN']}>
  <MedicalRecordEditor />
</RoleBasedAccess>

// Usage example: Only show content to users with specific permissions
<RoleBasedAccess featureId="medical_records_edit">
  <EditPatientRecords />
</RoleBasedAccess>
```

## Getting Started

### Prerequisites

- Node.js 16+
- Supabase account
- Civic Auth developer account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/healthcare-identity-platform.git
   cd healthcare-identity-platform
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and Civic Auth credentials
   ```

4. Set up the database
   ```bash
   npm run setup:database
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

### Demonstration

To run a demonstration of the platform's functionality:

```bash
# On Linux/Mac
./demo-script.sh

# On Windows
.\demo-script.ps1
```

## Security Features

- **Row-Level Security**: Database-level access controls
- **Blockchain Verification**: Tamper-proof identity and credential verification
- **Attestation Validation**: Expiration checking and cryptographic verification
- **Consent-Based Sharing**: Patients control who can access their data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
