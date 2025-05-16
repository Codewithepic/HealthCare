-- Role Verification Tables

-- Create role_verifications table
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

-- Enable Row Level Security
ALTER TABLE role_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own role verifications" 
  ON role_verifications FOR SELECT 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create healthcare_credentials table
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

-- Enable Row Level Security
ALTER TABLE healthcare_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own healthcare credentials" 
  ON healthcare_credentials FOR SELECT 
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create role_access_controls table for token-gated features
CREATE TABLE role_access_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name TEXT NOT NULL,
  required_roles TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some initial access controls
INSERT INTO role_access_controls (feature_name, required_roles, description)
VALUES 
  ('medical_records_view', ARRAY['PATIENT', 'PROVIDER', 'ADMIN'], 'View medical records'),
  ('medical_records_edit', ARRAY['PROVIDER', 'ADMIN'], 'Edit medical records'),
  ('provider_management', ARRAY['ADMIN'], 'Manage healthcare providers'),
  ('research_data_access', ARRAY['RESEARCHER', 'ADMIN'], 'Access anonymized research data'),
  ('user_management', ARRAY['ADMIN'], 'Manage user accounts');
