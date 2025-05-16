import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@civic/auth/react";
import CivicAuthButton from "./CivicAuthButton";

interface AuthFlowProps {
  onAuthenticate: (status: boolean) => void;
}

const AuthFlow = ({
  onAuthenticate,
}: AuthFlowProps) => {
  const { user, signIn, isLoading } = useUser();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already authenticated when component mounts
  useEffect(() => {
    if (!isLoading && user) {
      onAuthenticate(true);
    }
  }, [isLoading, user, onAuthenticate]);

  const handleCivicAuth = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      if (signIn) {
        await signIn();
      }
    } catch (err) {
      console.error("Civic Auth error:", err);
      setError("Authentication failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Add logo above the auth forms */}
      <div className="mb-8 flex flex-col items-center">
        <img 
          src="/healthcare-identity-logo.svg" 
          alt="Healthcare Identity" 
          className="h-20 w-20 mb-4 filter drop-shadow-md" 
        />
        <h1 className="text-2xl font-bold">Healthcare Identity Platform</h1>
        <p className="text-sm text-muted-foreground mt-1">Secure. Private. Blockchain-powered.</p>
        <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-950 px-3 py-1 rounded-full text-green-700 dark:text-green-400 text-xs font-medium">
          <svg className="w-4 h-4" viewBox="0 0 162 162" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M72.9 25.5c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
            <path fill="currentColor" d="M52.9 73.1c0-5.5 4.5-9.9 9.9-9.9h50.6c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9H62.8c-5.5 0-9.9-4.5-9.9-9.9V73.1z"/>
            <path fill="currentColor" d="M72.9 110.7c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
          </svg>
          <span>Powered by Civic Auth</span>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign In with Civic Auth</CardTitle>
          <CardDescription>
            Secure authentication with embedded wallet technology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-50 dark:bg-green-900/30 p-3">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-medium">Secure Blockchain Identity</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Authenticate with Civic to create your embedded wallet
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <CivicAuthButton
              onClick={handleCivicAuth}
              isLoading={authLoading}
              text="Sign In with Civic Auth"
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
            />
            
            <div className="mt-4 text-xs text-center text-muted-foreground">
              By signing in, you'll create a Civic embedded wallet that you control
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4 w-full max-w-md">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <h3 className="font-medium">Privacy Preserved</h3>
              <p className="text-sm text-muted-foreground">
                Your data remains private and only shared with your consent
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <h3 className="font-medium">Enhanced Security</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain security protects your identity and data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
