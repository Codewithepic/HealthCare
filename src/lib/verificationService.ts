import { supabase } from './supabase';
import axios from 'axios';

export type HealthcareRole = 
  | "PATIENT" 
  | "PROVIDER" 
  | "RESEARCHER" 
  | "ADMIN";

export interface VerificationResult {
  verified: boolean;
  role: HealthcareRole | null;
  credentials: VerifiedCredential[];
  attestationId?: string;
  expiresAt?: string;
}

export interface VerificationAttestation {
  id: string;
  walletAddress: string;
  role: HealthcareRole;
  issuedAt: string;
  expiresAt: string;
  issuer: string;
  verificationProof: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface VerifiedCredential {
  id: string;
  type: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  claims: Record<string, any>;
}

interface VerificationRequest {
  walletAddress: string;
  role: HealthcareRole;
  identityData: Record<string, any>;
}

// Enhanced verification for different healthcare roles
export const verifyHealthcareRole = async (
  walletAddress: string,
  requestedRole: HealthcareRole,
  userData: any
): Promise<VerificationResult> => {
  try {    // Step 1: Check if the wallet has any existing verifications
    const { data: existingVerification, error: fetchError } = await supabase
      .from('role_verifications')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'active')
      .maybeSingle();

    if (existingVerification) {
      console.log('Found existing verification:', existingVerification);
      
      // Check if verification is still valid
      if (new Date(existingVerification.expires_at) > new Date()) {
        return {
          verified: true,
          role: existingVerification.role as HealthcareRole,
          attestationId: existingVerification.attestation_id,
          expiresAt: existingVerification.expires_at,
          credentials: existingVerification.credentials || [],
        };
      }
    }

    // Step 2: Prepare for role-specific verification steps
    console.log(`Starting verification for ${requestedRole} role`);
    
    // Step 3: Execute verification process specific to each role
    let verificationResult: VerificationResult;
    
    switch(requestedRole) {
      case 'PATIENT':
        verificationResult = await verifyPatientRole(walletAddress, userData);
        break;
      case 'PROVIDER':
        verificationResult = await verifyProviderRole(walletAddress, userData);
        break;
      case 'RESEARCHER':
        verificationResult = await verifyResearcherRole(walletAddress, userData);
        break;
      case 'ADMIN':
        verificationResult = await verifyAdminRole(walletAddress, userData);
        break;
      default:
        throw new Error(`Invalid role requested: ${requestedRole}`);
    }

    // Step 4: If verification was successful, create an attestation on the blockchain
    if (verificationResult.verified && verificationResult.role) {
      const attestation = await createBlockchainAttestation(walletAddress, verificationResult.role);
      
      // Step 5: Store verification result in database
      await storeVerificationResult(
        walletAddress,
        verificationResult.role,
        attestation,
        verificationResult.credentials
      );

      // Add attestation ID to the result
      verificationResult.attestationId = attestation.id;
      verificationResult.expiresAt = attestation.expiresAt;
    }

    return verificationResult;
  } catch (error) {
    console.error('Error during healthcare role verification:', error);
    return { verified: false, role: null, credentials: [] };
  }
};

// Patient verification - less strict requirements
async function verifyPatientRole(walletAddress: string, userData: any): Promise<VerificationResult> {
  // For patients, basic verification is sufficient
  // In a real implementation, this might verify against an insurance database or ID verification
  
  try {
    // Step 1: Simulate basic identity verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Create a basic credential for the patient
    const patientCredential: VerifiedCredential = {
      id: `patient-${Date.now()}`,
      type: 'PatientIdentity',
      issuer: 'Healthcare Identity Platform',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
      claims: {
        verificationType: 'basic',
        verifiedAt: new Date().toISOString()
      }
    };

    return {
      verified: true,
      role: 'PATIENT',
      credentials: [patientCredential]
    };
  } catch (error) {
    console.error('Patient verification failed:', error);
    return { verified: false, role: null, credentials: [] };
  }
}

// Provider verification - requires professional credentials
async function verifyProviderRole(walletAddress: string, userData: any): Promise<VerificationResult> {
  try {
    // In a real implementation, this would check against medical board databases
    // For demo purposes, we'll simulate the verification steps
    
    // Step 1: Check for provider ID (mock)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Verify medical credentials (mock)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 3: Create provider credentials
    const licenseCredential: VerifiedCredential = {
      id: `license-${Date.now()}`,
      type: 'MedicalLicense',
      issuer: 'Medical Licensing Board',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 2 years
      claims: {
        licenseNumber: `ML${Math.floor(100000 + Math.random() * 900000)}`,
        specialty: userData?.specialty || 'General Medicine',
        verificationLevel: 'enhanced'
      }
    };

    const institutionCredential: VerifiedCredential = {
      id: `institution-${Date.now()}`,
      type: 'InstitutionalAffiliation',
      issuer: 'Healthcare Verification Network',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
      claims: {
        institutionName: userData?.organization || 'General Hospital',
        position: userData?.position || 'Physician',
        verifiedAt: new Date().toISOString()
      }
    };

    return {
      verified: true,
      role: 'PROVIDER',
      credentials: [licenseCredential, institutionCredential]
    };
  } catch (error) {
    console.error('Provider verification failed:', error);
    return { verified: false, role: null, credentials: [] };
  }
}

// Researcher verification - requires academic or institutional affiliation
async function verifyResearcherRole(walletAddress: string, userData: any): Promise<VerificationResult> {
  try {
    // For researchers, we need to verify their institutional affiliation
    
    // Step 1: Verify research institution (mock)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Step 2: Verify academic credentials (mock)
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Step 3: Create researcher credentials
    const researchCredential: VerifiedCredential = {
      id: `research-${Date.now()}`,
      type: 'ResearchAffiliation',
      issuer: 'Academic Research Network',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
      claims: {
        institution: userData?.institution || 'Medical Research Institute',
        department: userData?.department || 'Clinical Research',
        verificationLevel: 'academic',
        irb: true // Has IRB approval
      }
    };

    return {
      verified: true,
      role: 'RESEARCHER',
      credentials: [researchCredential]
    };
  } catch (error) {
    console.error('Researcher verification failed:', error);
    return { verified: false, role: null, credentials: [] };
  }
}

// Admin verification - highest level of scrutiny
async function verifyAdminRole(walletAddress: string, userData: any): Promise<VerificationResult> {
  try {
    // Admin verification would be the most stringent
    
    // Step 1: Verify organization admin status (mock)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Verify admin credentials (mock)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Verify multi-factor authentication (mock)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 4: Create admin credentials
    const adminCredential: VerifiedCredential = {
      id: `admin-${Date.now()}`,
      type: 'SystemAdministrator',
      issuer: 'Healthcare Platform Authority',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 6 months (shorter for security)
      claims: {
        accessLevel: 'system',
        clearanceLevel: 'high',
        verificationLevel: 'enhanced',
        multiFactorVerified: true
      }
    };

    return {
      verified: true,
      role: 'ADMIN',
      credentials: [adminCredential]
    };
  } catch (error) {
    console.error('Admin verification failed:', error);
    return { verified: false, role: null, credentials: [] };
  }
}

// Create an attestation on the blockchain for the verification
async function createBlockchainAttestation(
  walletAddress: string,
  role: HealthcareRole
): Promise<VerificationAttestation> {
  try {
    console.log(`Creating blockchain attestation for ${role} role`);
    
    // In a production environment, this would use the Civic attestation API or a blockchain transaction
    // For now, we'll simulate the blockchain attestation
    
    const expirationDate = new Date();
    switch (role) {
      case 'PATIENT':
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year
        break;
      case 'PROVIDER':
        expirationDate.setFullYear(expirationDate.getFullYear() + 2); // 2 years
        break;
      case 'RESEARCHER':
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // 1 year
        break;
      case 'ADMIN':
        expirationDate.setMonth(expirationDate.getMonth() + 6); // 6 months
        break;
    }
    
    // Create attestation object (in a real app, this would be returned from the blockchain)
    const attestation: VerificationAttestation = {
      id: `attestation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      walletAddress,
      role,
      issuedAt: new Date().toISOString(),
      expiresAt: expirationDate.toISOString(),
      issuer: 'Healthcare Identity Platform',
      verificationProof: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: 'active'
    };
    
    // In a real implementation, we would make an API call to register this on the blockchain
    // await civicClient.createAttestation(attestation);
    
    console.log('Attestation created:', attestation);
    
    return attestation;
  } catch (error) {
    console.error('Error creating blockchain attestation:', error);
    throw error;
  }
}

// Store verification results in the database
async function storeVerificationResult(
  walletAddress: string,
  role: HealthcareRole,
  attestation: VerificationAttestation,
  credentials: VerifiedCredential[]
) {
  try {
    console.log('Storing verification result in database');
      const { data, error } = await supabase
      .from('role_verifications')
      .upsert({
        wallet_address: walletAddress,
        role: role,
        issued_at: attestation.issuedAt,
        expires_at: attestation.expiresAt,
        attestation_id: attestation.id,
        attestation_proof: attestation.verificationProof,
        status: 'active',
        credentials: credentials
      }, {
        onConflict: 'wallet_address'
      });
      
    if (error) {
      throw error;
    }
    
    console.log('Verification stored in database');
    return data;
  } catch (error) {
    console.error('Error storing verification result:', error);
    throw error;
  }
}

// Request verification for a specific role
export const requestRoleVerification = async (
  walletAddress: string,
  requestedRole: HealthcareRole,
  userData?: Record<string, any>
): Promise<VerificationResult> => {
  try {
    // This would typically involve sending the user through a verification flow
    // with a trusted identity verification provider
    
    // For demo purposes, we'll simulate the verification process
    return await verifyHealthcareRole(walletAddress, requestedRole, userData);
  } catch (error) {
    console.error('Error requesting role verification:', error);
    return { verified: false, role: null, credentials: [] };
  }
};

// Validate a role attestation
export const validateRoleAttestation = async (attestationId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would verify the attestation on the blockchain
    // For now, we'll check our database
      const { data, error } = await supabase
      .from('role_verifications')
      .select('*')
      .eq('attestation_id', attestationId)
      .eq('status', 'active')
      .single();
      
    if (error || !data) {
      return false;
    }
    
    // Check if attestation is expired
    if (new Date(data.expires_at) < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating role attestation:', error);
    return false;
  }
};
