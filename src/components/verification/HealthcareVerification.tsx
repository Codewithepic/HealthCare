import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertCircle, Clock, RefreshCw, Fingerprint, FileCheck, BadgeCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@civic/auth-web3/react";
import WalletDebugger from "@/components/debug/WalletDebugger";
import EnhancedWalletDebugger from "@/components/debug/EnhancedWalletDebugger";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { getEmbeddedWalletInfo } from "@/lib/civicAuth";
import { requestRoleVerification, VerificationResult } from "@/lib/verificationService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define verification status types
type VerificationStatus = 
  | "NOT_STARTED" 
  | "WALLET_MISSING"
  | "PENDING" 
  | "VERIFIED" 
  | "REJECTED";

// Define healthcare role types
type HealthcareRole = 
  | "PATIENT" 
  | "PROVIDER" 
  | "RESEARCHER" 
  | "ADMIN";

interface HealthcareVerificationProps {
  userData: any;
  onVerificationComplete?: (verified: boolean, role: HealthcareRole) => void;
}

const HealthcareVerification = ({ 
  userData, 
  onVerificationComplete 
}: HealthcareVerificationProps) => {
  const { toast } = useToast();
  const { user: civicUser } = useUser();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("NOT_STARTED");
  const [healthcareRole, setHealthcareRole] = useState<HealthcareRole | null>(null);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use our new wallet address hook instead of manually extracting it
  const { 
    walletAddress, 
    isLoading: isLoadingWallet, 
    error: walletError,
    refreshWalletAddress 
  } = useWalletAddress();
  
  // Effect to check wallet status and set appropriate verification status
  useEffect(() => {
    if (isLoadingWallet) {
      return; // Still loading, don't do anything yet
    }
    
    if (!walletAddress && verificationStatus === "NOT_STARTED") {
      setVerificationStatus("WALLET_MISSING");
    } else if (walletAddress && verificationStatus === "WALLET_MISSING") {
      setVerificationStatus("NOT_STARTED"); // Reset to not started once we have wallet
    }
    
    // Log diagnostic info
    console.log('HealthcareVerification: User data', { civicUser, userData });
    console.log('HealthcareVerification: Wallet address from hook', walletAddress);
    console.log('HealthcareVerification: Wallet error', walletError);
  }, [walletAddress, isLoadingWallet, walletError, verificationStatus]);
  
  // Effect to check for previously stored verification status
  useEffect(() => {
    // Check if we have any stored verification status
    if (walletAddress) {
      const storedStatus = localStorage.getItem(`healthcare_verification_${walletAddress}`);
      if (storedStatus) {
        try {
          const { status, role } = JSON.parse(storedStatus);
          setVerificationStatus(status);
          setHealthcareRole(role);
          
          // If verification was already completed, notify parent component
          if (status === "VERIFIED" && role && onVerificationComplete) {
            onVerificationComplete(true, role);
          }
        } catch (e) {
          console.error("Error parsing stored verification status:", e);
        }
      }
    }
  }, [walletAddress, onVerificationComplete]);

  // Retry wallet detection
  const retryWalletDetection = async () => {
    setRetryCount(prev => prev + 1);
    
    try {
      toast({
        title: "Retrying wallet detection",
        description: "Attempting to detect your blockchain wallet...",
      });
      
      const newWalletAddress = await refreshWalletAddress();
      
      if (newWalletAddress) {
        toast({
          title: "Wallet found!",
          description: "Successfully detected your blockchain wallet. You can now start verification.",
        });
        setVerificationStatus("NOT_STARTED");
      } else {
        toast({
          title: "Wallet detection failed",
          description: "Could not detect your blockchain wallet. Please ensure you're logged in with Civic Auth.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Error retrying wallet detection:", e);
      toast({
        title: "Error",
        description: "Failed to retry wallet detection. Please try again.",
        variant: "destructive",
      });
    }
  };
  // Role selection form schema for verification
  const FormSchema = z.object({
    role: z.enum(["PATIENT", "PROVIDER", "RESEARCHER", "ADMIN"], {
      required_error: "Please select a role to verify.",
    }),
  });

  // Form for role selection
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  // Dialog state for role selection
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Start the verification process
  const startVerification = () => {
    if (!walletAddress) {
      setVerificationStatus("WALLET_MISSING");
      toast({
        title: "Verification Error",
        description: "No blockchain wallet address detected. Please ensure you're logged in with Civic Auth.",
        variant: "destructive",
      });
      return;
    }
    
    // Open the role selection dialog
    setRoleDialogOpen(true);
  };

  // Handle the actual verification process after role selection
  const handleRoleVerification = async (values: z.infer<typeof FormSchema>) => {
    setRoleDialogOpen(false);
    
    // Set status to pending
    setVerificationStatus("PENDING");
    
    // Start progress indicator
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { // Cap at 95% until verification completes
          return 95;
        }
        return prev + Math.random() * 5; // Randomize progress updates for realism
      });
    }, 500);
    
    try {
      // Call the verification service with the selected role
      const result = await requestRoleVerification(
        walletAddress, 
        values.role as HealthcareRole, 
        userData
      );
      
      // Update progress to 100%
      clearInterval(interval);
      setProgress(100);
      
      if (result.verified && result.role) {
        // Successfully verified
        setHealthcareRole(result.role);
        setVerificationStatus("VERIFIED");
        
        // Store verification status with blockchain attestation
        localStorage.setItem(
          `healthcare_verification_${walletAddress}`,
          JSON.stringify({
            status: "VERIFIED",
            role: result.role,
            attestationId: result.attestationId,
            expiresAt: result.expiresAt,
            credentials: result.credentials
          })
        );

        // Notify parent component
        if (onVerificationComplete) {
          onVerificationComplete(true, result.role);
        }

        toast({
          title: "Verification Complete",
          description: `Your identity has been verified as a Healthcare ${result.role.toLowerCase()}.`,
        });
      } else {
        // Verification failed
        setVerificationStatus("REJECTED");
        
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your healthcare identity. Please check your information and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Handle errors
      clearInterval(interval);
      setVerificationStatus("REJECTED");
      console.error("Verification error:", error);
      
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Reset verification (for testing)
  const resetVerification = () => {
    setVerificationStatus("NOT_STARTED");
    setHealthcareRole(null);
    setProgress(0);
    
    if (walletAddress) {
      localStorage.removeItem(`healthcare_verification_${walletAddress}`);
    }
    
    toast({
      title: "Verification Reset",
      description: "You can start the verification process again.",
    });
  };
  // Render appropriate UI based on verification status
  const renderVerificationContent = () => {
    switch (verificationStatus) {
      case "WALLET_MISSING":
        return (
          <div className="flex flex-col items-center space-y-4 py-6">
            <AlertCircle className="h-16 w-16 text-amber-500" />
            <h3 className="text-lg font-medium">Wallet Not Detected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              We couldn't detect your blockchain wallet. This is required for healthcare identity verification.
            </p>
            <div className="flex flex-col space-y-2 w-full max-w-md">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
                <p className="font-medium text-amber-800">Troubleshooting steps:</p>
                <ul className="list-disc list-inside text-amber-700 text-xs mt-1 space-y-1">
                  <li>Make sure you're logged in with Civic Auth</li>
                  <li>Check that your blockchain wallet is properly connected</li>
                  <li>Try refreshing the page or logging out and back in</li>
                  <li>Ensure your Civic Auth account has a connected wallet</li>
                </ul>
              </div>
              <Button 
                className="mt-4 gap-2" 
                onClick={retryWalletDetection}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Wallet Detection
              </Button>
              
              {retryCount > 1 && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Still having issues? Try logging out and back in to refresh your Civic Auth session.
                </p>
              )}
            </div>
          </div>
        );
        
      case "NOT_STARTED":
        return (
          <div className="flex flex-col items-center space-y-4 py-6">
            <Shield className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-medium">Healthcare Identity Verification</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Verify your healthcare role using your blockchain identity. This process connects your 
              Civic Auth wallet with healthcare credentials.
            </p>
            <Button 
              className="mt-4" 
              onClick={startVerification}
              disabled={!walletAddress || isLoadingWallet}
            >
              {isLoadingWallet ? 'Loading wallet...' : 'Start Verification'}
            </Button>
            {isLoadingWallet ? (
              <p className="text-xs text-amber-500 text-center max-w-md">
                Loading wallet information...
              </p>
            ) : !walletAddress ? (
              <p className="text-xs text-red-500 text-center max-w-md">
                No wallet address detected. Please ensure you're logged in with Civic Auth and that the wallet is connected properly.
              </p>
            ) : (
              <p className="text-xs text-green-600 text-center max-w-md">
                Wallet address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            )}
          </div>
        );
      
      case "PENDING":
        return (
          <div className="flex flex-col items-center space-y-4 py-6">
            <Clock className="h-16 w-16 text-amber-500 animate-pulse" />
            <h3 className="text-lg font-medium">Verification in Progress</h3>
            <p className="text-sm text-muted-foreground text-center">
              We're verifying your blockchain identity with healthcare authorities.
            </p>
            <div className="w-full max-w-md mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-right mt-1">{progress}% complete</p>
            </div>
          </div>
        );
        case "VERIFIED":
        // Get verification details from local storage
        const verificationDetails = walletAddress ? 
          JSON.parse(localStorage.getItem(`healthcare_verification_${walletAddress}`) || '{}') : {};
        
        // Extract credentials and attestation info
        const credentials = verificationDetails.credentials || [];
        const attestationId = verificationDetails.attestationId;
        const expiresAt = verificationDetails.expiresAt;
        const expiryDate = expiresAt ? new Date(expiresAt) : null;
        
        return (
          <div className="flex flex-col items-center space-y-4 py-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-lg font-medium">Verification Complete</h3>
            <p className="text-sm text-center">
              Your healthcare identity has been successfully verified.
            </p>
            
            {healthcareRole && (
              <div className="flex flex-col items-center mt-2 w-full">
                <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 px-4 py-2 rounded-md font-medium">
                  Healthcare Role: {healthcareRole}
                </div>
                
                {/* Attestation details */}
                <div className="mt-4 w-full max-w-md border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Blockchain Attestation</h4>
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">On Chain</div>
                  </div>
                  
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{attestationId || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span className="font-mono text-xs">
                        {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Unknown'}
                      </span>
                    </div>
                    
                    {expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{expiryDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Credentials */}
                {credentials.length > 0 && (
                  <div className="mt-4 w-full max-w-md">
                    <h4 className="text-sm font-medium mb-2">Verified Credentials</h4>
                    <div className="space-y-2">
                      {credentials.map((credential, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{credential.type}</span>
                            <span className="text-xs text-muted-foreground">
                              Issued by: {credential.issuer}
                            </span>
                          </div>
                          {credential.claims && (
                            <div className="mt-2 bg-muted/30 p-2 rounded text-xs">
                              {Object.entries(credential.claims).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-2 gap-1">
                                  <span className="text-muted-foreground">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6">
              <Button variant="outline" size="sm" onClick={resetVerification}>
                Reset Verification (Demo Only)
              </Button>
            </div>
          </div>
        );
      
      case "REJECTED":
        return (
          <div className="flex flex-col items-center space-y-4 py-6">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-lg font-medium">Verification Failed</h3>
            <p className="text-sm text-muted-foreground text-center">
              We couldn't verify your healthcare identity. Please try again or contact support.
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={startVerification}
            >
              Try Again
            </Button>
          </div>
        );
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Healthcare Verification
          </CardTitle>
          <CardDescription>
            Verify your healthcare identity using blockchain credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderVerificationContent()}
          
          {/* Add enhanced wallet debugger component that's only visible in development */}
          {import.meta.env.DEV && (
            <>
              <EnhancedWalletDebugger userData={userData} />
              {/* Keep the original debugger as a fallback */}
              <div className="opacity-50 mt-4">
                <WalletDebugger userData={userData} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Role Selection Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Healthcare Role</DialogTitle>
            <DialogDescription>
              Choose the healthcare role you want to verify. You'll be asked to provide appropriate credentials.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRoleVerification)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Healthcare Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="PATIENT" />
                          </FormControl>
                          <div className="flex items-center gap-2">
                            <Fingerprint className="h-5 w-5 text-blue-500" />
                            <div>
                              <FormLabel className="font-medium">Patient</FormLabel>
                              <p className="text-sm text-muted-foreground">Access your medical records</p>
                            </div>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="PROVIDER" />
                          </FormControl>
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-green-500" />
                            <div>
                              <FormLabel className="font-medium">Healthcare Provider</FormLabel>
                              <p className="text-sm text-muted-foreground">Access patient records and provide care</p>
                            </div>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="RESEARCHER" />
                          </FormControl>
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-amber-500" />
                            <div>
                              <FormLabel className="font-medium">Researcher</FormLabel>
                              <p className="text-sm text-muted-foreground">Access anonymized data for research</p>
                            </div>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="ADMIN" />
                          </FormControl>
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-500" />
                            <div>
                              <FormLabel className="font-medium">Administrator</FormLabel>
                              <p className="text-sm text-muted-foreground">Manage the healthcare platform</p>
                            </div>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Begin Verification</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HealthcareVerification;
