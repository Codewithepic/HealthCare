import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a more helpful error message for missing variables
if (!supabaseUrl || supabaseUrl === 'your-supabase-project.supabase.co') {
  console.warn('Please set VITE_SUPABASE_URL in your .env file to your Supabase project URL.');
  // For development only - log instructions on how to get credentials
  if (import.meta.env.DEV) {
    console.info('To get your Supabase URL:\n1. Go to https://supabase.com and sign in\n2. Select your project\n3. Go to Project Settings > API\n4. Copy the "Project URL"');
  }
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn('Please set VITE_SUPABASE_ANON_KEY in your .env file to your Supabase anonymous key.');
  // For development only - log instructions on how to get credentials
  if (import.meta.env.DEV) {
    console.info('To get your Supabase anon key:\n1. Go to https://supabase.com and sign in\n2. Select your project\n3. Go to Project Settings > API\n4. Copy the "anon" key under "Project API keys"');
  }
}

// Create Supabase client with fallback values for development
export const supabase = createClient(
  supabaseUrl || 'https://your-supabase-project.supabase.co', // Fallback URL for development
  supabaseAnonKey || 'your-supabase-anon-key' // Fallback key for development
);

// Helper functions for authentication
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log(`Attempting to sign in with email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error during signInWithEmail:', err);
    return { data: null, error: err };
  }
};

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },  });
  return { data, error };
};

// We have removed Google Sign-in as it's not currently supported in this application

export const signInWithCivicId = async () => {
  console.warn('signInWithCivicId() is deprecated. Use the useUser().signIn() hook from @civic/auth/react instead');
  return { data: null, error: null };
};

export const signOut = async () => {
  // Sign out from Supabase
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error during sign out:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  // Get user from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  // Get session from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
