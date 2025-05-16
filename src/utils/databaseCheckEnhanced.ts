// Enhanced utility to check Supabase database connection and data
import { supabase } from '@/lib/supabase';

/**
 * Function to check if we can connect to the database
 * This function is more lenient with missing tables
 */
export const checkDatabaseConnection = async () => {
  try {
    // Check if we have valid Supabase URL and key 
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'your-supabase-project.supabase.co') {
      return {
        connected: false,
        message: 'Invalid Supabase URL detected',
        warning: 'Please set a valid VITE_SUPABASE_URL in your .env file'
      };
    }
    
    if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
      return {
        connected: false,
        message: 'Invalid Supabase anon key detected',
        warning: 'Please set a valid VITE_SUPABASE_ANON_KEY in your .env file'
      };
    }
    
    // First try to connect using auth.getSession() which should always be available
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (!sessionError) {
      return {
        connected: true,
        message: 'Successfully connected to Supabase API',
        warning: sessionData.session ? 
          `Active session found for user: ${sessionData.session.user.email || sessionData.session.user.id}` : 
          'No active session found, but connection is working'
      };
    }
    
    // If session check fails, try a generic health check
    const { error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      // If the error is that the table doesn't exist, that's actually okay
      // It just means we're connected to the database but the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL error code for undefined_table
        return {
          connected: true,
          message: 'Successfully connected to Supabase database',
          warning: 'The health_check table does not exist, but the connection is working'
        };
      }
      
      console.error('Database connection error:', error);
      return {
        connected: false,
        message: `Connection error: ${error.message}`,
        error
      };
    }
    
    return {
      connected: true,
      message: 'Successfully connected to Supabase database'
    };
  } catch (err) {
    console.error('Unexpected error during database check:', err);
    return {
      connected: false,
      message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      error: err
    };
  }
};

/**
 * Function to check if medical records table exists and has data
 * This function handles missing tables gracefully
 */
export const checkMedicalRecords = async () => {
  try {
    // Try to query the medical_records table
    const { data, error, count } = await supabase
      .from('medical_records')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      // If the error is that the table doesn't exist, that's expected for new setups
      if (error.code === '42P01') { // PostgreSQL error code for undefined_table
        return {
          exists: false,
          message: 'Medical records table does not exist in the database',
          warning: 'The medical_records table hasn\'t been created yet. This is normal for a new setup.'
        };
      }
      
      console.error('Error querying medical records:', error);
      return {
        exists: false,
        message: `Query error: ${error.message}`,
        error
      };
    }
    
    return {
      exists: true,
      message: `Found ${count} medical records in the database`,
      recordCount: count,
      sampleRecords: data,
    };
  } catch (err) {
    console.error('Unexpected error checking medical records:', err);
    return {
      exists: false,
      message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      error: err
    };
  }
};

/**
 * Function to check user data in auth.users or profiles
 * This function tries multiple approaches and handles missing tables
 */
export const checkUsers = async () => {
  try {
    // First check if there's an authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userData?.user) {
      return {
        success: true,
        message: `Found authenticated user: ${userData.user.email || userData.user.id}`,
        currentUser: userData.user
      };
    }
    
    // Try the auth list users API (requires admin key, likely to fail with anon key)
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authData?.users?.length > 0) {
        return {
          success: true,
          message: `Found ${authData.users.length} users in auth.users`,
          userCount: authData.users.length,
          sampleUsers: authData.users.slice(0, 5),
        };
      }
    } catch (adminError) {
      // This is expected to fail with anon key, just continue to next check
      console.log('Admin API check failed (expected with anon key)');
    }
    
    // Check profiles table (this is a common pattern in Supabase apps)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (!profilesError && profilesData?.length > 0) {
      return {
        success: true,
        message: `Found ${profilesData.length} user profiles in the profiles table`,
        userCount: profilesData.length,
        sampleProfiles: profilesData,
      };
    } else if (profilesError && profilesError.code !== '42P01') {
      // Only log if it's not a "table doesn't exist" error
      console.error('Error querying profiles:', profilesError);
    }
    
    // Check users table (alternative pattern)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (!usersError && usersData?.length > 0) {
      return {
        success: true,
        message: `Found ${usersData.length} records in the users table`,
        userCount: usersData.length,
        sampleUsers: usersData,
      };
    } else if (usersError && usersError.code !== '42P01') {
      // Only log if it's not a "table doesn't exist" error
      console.error('Error querying users:', usersError);
    }
    
    // If we got here, no user data was found
    return {
      success: false,
      warning: 'No user data found. This is normal for a new Supabase project.',
      message: 'Could not find user data in auth.users, profiles, or users tables',
    };
  } catch (err) {
    console.error('Unexpected error checking users:', err);
    return {
      success: false,
      message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      error: err
    };
  }
};

/**
 * Function to check if there's an active session
 */
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error);
      return {
        active: false,
        message: `Session error: ${error.message}`,
        error
      };
    }
    
    if (data?.session) {
      return {
        active: true,
        message: `Active session found for user: ${data.session.user.email || data.session.user.id}`,
        session: data.session
      };
    }
    
    return {
      active: false,
      message: 'No active session found - this is normal if you\'re not logged in',
      warning: 'You may need to sign in to access protected resources',
      session: null
    };
  } catch (err) {
    console.error('Unexpected error checking session:', err);
    return {
      active: false,
      message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      error: err
    };
  }
};

/**
 * Function to check for missing database tables and suggest SQL to create them
 */
export const checkDatabaseSchema = async () => {
  const tables = ['profiles', 'medical_records', 'providers', 'access_permissions'];
  const results: Record<string, { exists: boolean; error: any }> = {};
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
      
    results[table] = {
      exists: !error || error.code !== '42P01',
      error: error?.code === '42P01' ? null : error
    };
  }
  
  // Create suggested SQL for missing tables
  const suggestedSQL = Object.entries(results)
    .filter(([_, result]) => !result.exists)
    .map(([table]) => {
      switch(table) {
        case 'profiles':
          return `
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
`;
        
        case 'medical_records':
          return `
-- Create medical_records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  record_type TEXT NOT NULL,
  record_date DATE NOT NULL,
  provider TEXT,
  notes TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own medical records" 
  ON medical_records FOR SELECT 
  USING (auth.uid() = patient_id);
`;
        
        case 'providers':
          return `
-- Create providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;
        
        case 'access_permissions':
          return `
-- Create access_permissions table
CREATE TABLE access_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES providers(id),
  permission_level TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE access_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own access permissions" 
  ON access_permissions FOR ALL
  USING (auth.uid() = patient_id);
`;
        default:
          return `-- Table ${table} not found but no creation script is available`;
      }
    }).join('\n\n');
  
  return {
    tables: results,
    suggestedSQL: suggestedSQL
  };
};

/**
 * Run all checks and log results
 */
export const runDatabaseChecks = async () => {
  console.log('Running enhanced Supabase database checks...');
  
  const connectionResult = await checkDatabaseConnection();
  console.log('Connection check:', connectionResult);
  
  const sessionResult = await checkSession();
  console.log('Session check:', sessionResult);
  
  if (connectionResult.connected) {
    const recordsResult = await checkMedicalRecords();
    console.log('Medical records check:', recordsResult);
    
    const usersResult = await checkUsers();
    console.log('Users check:', usersResult);
    
    const schemaResult = await checkDatabaseSchema();
    console.log('Schema check:', schemaResult);
    
    return {
      connection: connectionResult,
      session: sessionResult,
      records: recordsResult,
      users: usersResult,
      schema: schemaResult
    };
  }
  
  return {
    connection: connectionResult,
    session: sessionResult,
    records: { exists: false, message: 'Skipped due to connection failure' },
    users: { success: false, message: 'Skipped due to connection failure' },
    schema: { message: 'Skipped due to connection failure' }
  };
};
