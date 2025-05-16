import { useState } from "react";
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
  UserIcon, 
  EyeIcon, 
  EyeOffIcon, 
  AlertCircle,
  Loader2,
  Wallet
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUpWithEmail } from "@/lib/supabase";
import { useUser } from "@civic/auth/react";
import CivicAuthButton from "./CivicAuthButton";
import { extractWalletAddress } from "@/lib/userDataUtils";

interface SignupFormProps {
  onSignup: (userData: any) => void;
  onSwitchToLogin: () => void;
}

const SignupForm = ({ onSignup, onSwitchToLogin }: SignupFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  const [error, setError] = useState("");  
  const [civicLoading, setCivicLoading] = useState(false);
  const user = useUser();  // Get the full user object
  const { signIn, isLoading: isCivicLoading } = user;  // Handle Civic Auth sign in/sign up
  const handleCivicSignIn = async () => {
    setCivicLoading(true);
    try {
      // Using any type for the user object due to incomplete types in the Civic SDK
      const user = await signIn() as any;
      if (user) {
        // Extract username from email if no name is provided
        const displayName = user.name || user.displayName || user.email?.split('@')[0] || "Healthcare User";
        
        // Extract wallet address using the utility function
        const walletAddress = extractWalletAddress(user);
        
        onSignup({ 
          name: displayName, 
          displayName,
          email: user.email,
          walletAddress // Include wallet address in user data
        });
      }    } catch (error) {
      console.error("Civic Auth error:", error);
      // Check if the error is because the user aborted the sign-in process
      if (error instanceof Error && error.message.includes("aborted by user")) {
        setError("Authentication was cancelled. Please try again.");
      } else {
        setError("Failed to authenticate with Civic ID");
      }
    } finally {
      setCivicLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signUpWithEmail(email, password, { name });
      if (error) {
        throw error;
      }
      
      // Pass user's name and formatted display name
      onSignup({ 
        name, 
        displayName: name,
        email,
        walletAddress: null // Include wallet address as null for traditional signup
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (    <Card className="w-full max-w-[400px] shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Join the secure healthcare identity network
        </CardDescription>
      </CardHeader>
      <CardContent>        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {user.user ? (
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-sm font-medium">Successfully authenticated!</h3>
              </div>
            </div>
            <p>Signed in as {user.user.email || "User"}</p>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => user.signOut()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>                <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <UserIcon className="h-5 w-5" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10 h-12 text-base"                  value={name}
                  onChange={(e) => setName(e.target.value)}                  
                  required
                  disabled={isLoading || isCivicLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>                <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <MailIcon className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 text-base"                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isCivicLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>                <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <LockIcon className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-12 text-base"                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isCivicLoading}
                />                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-3 text-muted-foreground"                  onClick={() => setShowPassword(!showPassword)}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>                <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <LockIcon className="h-5 w-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 h-12 text-base"                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || isCivicLoading}
                />
              </div>
            </div>            <div className="pt-2">              <Button                type="submit" 
                className="w-full font-medium"                
                disabled={isLoading || isCivicLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
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
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm"                type="button"
                onClick={onSwitchToLogin}
                disabled={isLoading || user.isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default SignupForm;
