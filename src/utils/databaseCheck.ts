// Utility to check Supabase database connection and data
import { supabase } from '@/lib/supabase';

// Function to check if we can connect to the database
export const checkDatabaseConnection = async () => {
  try {
    // Simple query to check if we can connect to the database
    // We don't expect this query to succeed, but it should connect to the database
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      // If the error is that the table doesn't exist, that's actually okay
      // It just means we're connected to the database but the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL error code for undefined_table
        return {
          connected: true,
          message: 'Successfully connected to Supabase database (health_check table not found)',
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
      message: 'Successfully connected to Supabase database',
      data
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

// Function to check if medical records table exists and has data
export const checkMedicalRecords = async () => {
  try {
    // Try to query the medical_records table
    // Note: This assumes you have a table called "medical_records" in your Supabase database
    const { data, error, count } = await supabase
      .from('medical_records')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      if (error.code === '42P01') { // PostgreSQL error code for undefined_table
        return {
          exists: false,
          message: 'Medical records table does not exist in the database',
          error
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

// Function to check user data in auth.users
export const checkUsers = async () => {
  try {
    // Try to get current user first
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      return {
        success: true,
        message: `Found authenticated user: ${userData.user.email || userData.user.id}`,
        currentUser: userData.user
      };
    }
    
    // If no current user, check if we can access user profiles
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      // If profiles table doesn't exist, try users table
      if (error.code === '42P01') {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(5);
          
        if (usersError) {
          console.error('Error querying users:', usersError);
          return {
            success: false,
            message: 'No authenticated user and could not access profiles or users table',
            error: usersError
          };
        }
        
        return {
          success: true,
          message: `Found ${usersData.length} users in the users table`,
          sampleUsers: usersData,
        };
      }
      
      console.error('Error querying profiles:', error);
      return {
        success: false,
        message: `Query error: ${error.message}`,
        error
      };
    }
      return {
      success: true,
      message: `Found ${count} profiles in the database`,
      userCount: count,
      sampleProfiles: data,
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

// Function to check if there's an active session
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
      message: 'No active session found',
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

// Run all checks and log results
export const runDatabaseChecks = async () => {
  console.log('Running Supabase database checks...');
  
  const connectionResult = await checkDatabaseConnection();
  console.log('Connection check:', connectionResult);
  
  const sessionResult = await checkSession();
  console.log('Session check:', sessionResult);
  
  if (connectionResult.connected) {
    const recordsResult = await checkMedicalRecords();
    console.log('Medical records check:', recordsResult);
    
    const usersResult = await checkUsers();
    console.log('Users check:', usersResult);
    
    return {
      connection: connectionResult,
      session: sessionResult,
      records: recordsResult,
      users: usersResult
    };
  }
  
  return {
    connection: connectionResult,
    session: sessionResult,
    records: { exists: false, message: 'Skipped due to connection failure' },
    users: { success: false, message: 'Skipped due to connection failure' }
  };
};
