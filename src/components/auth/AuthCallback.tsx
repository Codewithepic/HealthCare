import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUser } from '@civic/auth/react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');
  const { user, isLoading, error } = useUser();
  
  useEffect(() => {
    // Handle the Civic Auth callback
    const handleAuthCallback = async () => {
      try {
        // Check for Civic Auth 
        if (isLoading) {
          setStatus('Processing Civic authentication...');
          return; // Wait for Civic Auth to complete processing
        }
        
        if (user) {
          setStatus('Civic Web3 authentication successful!');
          // Display success and redirect to home
          setStatus(`Authentication successful! Your identity is secured.`);
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        if (error) {
          console.error('Error with Civic authentication:', error);
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // No session found, redirect to login
        setStatus('No active session found. Redirecting to login...');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setStatus('An unexpected error occurred. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, isLoading, user, error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-2 text-center">
          <svg className="w-12 h-12 text-primary" viewBox="0 0 162 162" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M72.9 25.5c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
            <path fill="currentColor" d="M52.9 73.1c0-5.5 4.5-9.9 9.9-9.9h50.6c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9H62.8c-5.5 0-9.9-4.5-9.9-9.9V73.1z"/>
            <path fill="currentColor" d="M72.9 110.7c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
          </svg>
          <h1 className="text-2xl font-bold">Authentication</h1>
          <p className="text-muted-foreground">{status}</p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
