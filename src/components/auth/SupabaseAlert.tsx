import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

const SupabaseAlert = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const civicAppId = import.meta.env.VITE_CIVIC_APP_ID;

  // Check if Civic is properly configured
  if (!civicAppId) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Civic Auth Configuration Required</AlertTitle>
        <AlertDescription>
          Please set the VITE_CIVIC_APP_ID environment variable in your .env file to enable Civic authentication.
        </AlertDescription>
      </Alert>
    );
  }

  // Only show the Supabase alert if using placeholder values
  if (
    !supabaseUrl || 
    supabaseUrl === 'https://placeholder-project.supabase.co' ||
    !supabaseKey ||
    supabaseKey.includes('placeholder')
  ) {    return (
      <Alert className="mb-4 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Supabase Configuration</AlertTitle>
        <AlertDescription>
          Email/password authentication requires Supabase configuration. You can still use Civic Auth for blockchain-based authentication.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SupabaseAlert;
