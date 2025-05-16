import { supabase, getSession, getCurrentUser, signOut } from '@/lib/supabase';

/**
 * Helper function to test the authentication setup
 * Run this function in a browser console or integrate into your app for testing
 */
export async function testAuthSetup() {
  console.log('Testing Supabase Authentication Setup');
  
  try {
    // 1. Check if Supabase is properly initialized
    console.log('1. Checking Supabase client initialization...');
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    console.log('✅ Supabase client initialized successfully');
    
    // 2. Check if environment variables are set
    console.log('2. Checking environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Environment variables are not set properly. Check your .env file.');
    }
    console.log('✅ Environment variables are set correctly');
    
    // 3. Check current session status
    console.log('3. Checking current session...');
    const session = await getSession();
    if (session) {
      console.log('✅ User is currently logged in');
      
      // 4. Get user info
      console.log('4. Getting current user information...');
      const user = await getCurrentUser();
      console.log('Current user:', user);
      
      // 5. Test sign out
      console.log('5. Testing sign out functionality...');
      const { error } = await signOut();
      
      if (error) {
        throw new Error(`Error signing out: ${error.message}`);
      }
      
      console.log('✅ Sign out successful');
      
      // 6. Verify session is cleared
      const sessionAfterSignOut = await getSession();
      if (!sessionAfterSignOut) {
        console.log('✅ Session cleared successfully');
      } else {
        throw new Error('Session still exists after sign out');
      }
    } else {
      console.log('ℹ️ No active session found. User is not logged in.');
      console.log('To complete testing, please log in and run this test again.');
    }
    
    console.log('✅ Authentication test completed successfully.');
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
}

// You can run this function manually in development to test your auth setup
// testAuthSetup();
