import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  AlertCircle, 
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInWithEmail } from "@/lib/supabase";
import { useUser } from "@civic/auth/react";
import CivicAuthButton from "./CivicAuthButton";
import { captureException } from "@/lib/sentry";
import { extractWalletAddress } from "@/lib/userDataUtils";
import { requestPermission } from "@/lib/permissionManager";
import { useCivicAuthPermissions } from "@/hooks/useCivicAuthPermissions";
import { getEmbeddedWalletInfo } from "@/lib/civicAuth";

interface LoginFormProps {
  onLogin: (email: string, password: string, userData?: any) => void;
  onSwitchToSignup: () => void; // Added prop for switching to signup
}

const LoginForm = ({ onLogin, onSwitchToSignup }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [civicLoading, setCivicLoading] = useState(false);  const { signIn, isLoading: isCivicLoading } = useUser();  // Handle Civic Auth sign in
  
  // Use our custom hook to request permissions preemptively
  useCivicAuthPermissions();
    const handleCivicSignIn = async () => {
    setCivicLoading(true);
    
    try {
      // Try to explicitly request camera permission before authentication
      // This can help prevent the permissions policy violation warning
      await requestPermission('camera');
      
      // For wake lock, we'll request it only on supported browsers
      if ('wakeLock' in navigator) {
        await requestPermission('screen-wake-lock');
      }
        // Using any type for the user object due to incomplete types in the Civic SDK
      const user = await signIn() as any;
      if (user) {
        // Extract username from email if no name is provided
        const displayName = user.name || user.displayName || user.email?.split('@')[0] || "Healthcare User";
        
        // Get wallet address using the Civic Auth embedded wallet API
        let walletAddress = null;
        try {
          // First try to get wallet info directly from the Civic Auth API
          const walletInfo = await getEmbeddedWalletInfo(user);
          if (walletInfo.data?.publicKey) {
            walletAddress = walletInfo.data.publicKey;
            console.log('Retrieved wallet address from Civic API:', walletAddress);
          }
        } catch (walletError) {
          console.error('Error getting wallet address from Civic Auth:', walletError);
          // Fallback to extraction methods
          walletAddress = extractWalletAddress(user);
        }
        
        // Log the wallet address to help with debugging
        console.log('Civic Auth user object:', user);
        console.log('Final wallet address:', walletAddress);
        
        onLogin(user.email || "", "", { 
          name: displayName, 
          displayName,
          email: user.email,
          walletAddress, // Include wallet address in user data
          wallet: walletAddress, // Include it in both fields for compatibility
          provider: "Civic Auth"
        });
      }}catch (error) {
      console.error("Civic Auth error:", error);
      // Check if the error is because the user aborted the sign-in process
      if (error instanceof Error && error.message.includes("aborted by user")) {
        setError("Authentication was cancelled. Please try again.");
      } else {
        setError("Failed to authenticate with Civic ID");
        captureException(error, { context: "civic_auth_signin" });
      }
    } finally {
      setCivicLoading(false);
    }
  };
  // Handle traditional email login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.error("Login error:", error);
        if (error.message?.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        } else if (error.message?.includes("Email not confirmed")) {
          throw new Error("Please confirm your email address before signing in.");
        } else {
          throw error;
        }
      }
        // Extract username from email if no name is provided
      const displayName = email.split('@')[0];
        // Call the onLogin function from props to update parent component state
      onLogin(email, password, { 
        name: displayName, 
        displayName, 
        email,
        walletAddress: null // Include wallet address as null for traditional login
      });
    } catch (err: any) {
      console.error("Login error details:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
      captureException(err, { 
        context: "email_password_login",
        email: email ? email.substring(0, 3) + "***" : undefined // Partial email for context without exposing full email
      });
    } finally {
      setIsLoading(false);
    }
  };  return (
    <Card className="w-full max-w-[400px] shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Access your secure healthcare identity
        </CardDescription>
      </CardHeader>
      <CardContent>        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>            <div className="relative">
              <div className="absolute left-3 top-3 text-muted-foreground">
                <MailIcon className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isCivicLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Button
                variant="link"
                className="p-0 h-auto text-xs font-normal"
                type="button"
              >
                Forgot password?
              </Button>
            </div>            <div className="relative">
              <div className="absolute left-3 top-3 text-muted-foreground">
                <LockIcon className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10 h-12 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isCivicLoading}
              />                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-3 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isCivicLoading}
                >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full font-medium" 
              disabled={isLoading || isCivicLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <CivicAuthButton 
              onClick={handleCivicSignIn}
              isLoading={civicLoading}
              disabled={isLoading}
              text="Civic Auth"
              className="w-full"
            />
            <p className="text-xs text-center text-muted-foreground mt-1">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 162 162" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M72.9 25.5c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
                  <path fill="currentColor" d="M52.9 73.1c0-5.5 4.5-9.9 9.9-9.9h50.6c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9H62.8c-5.5 0-9.9-4.5-9.9-9.9V73.1z"/>
                  <path fill="currentColor" d="M72.9 110.7c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
                </svg>
                Recommended: Secure blockchain-based authentication
              </span>
            </p>
          </div>          <div className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm"
              type="button"
              onClick={onSwitchToSignup}
              disabled={isLoading || isCivicLoading}
            >
              Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
