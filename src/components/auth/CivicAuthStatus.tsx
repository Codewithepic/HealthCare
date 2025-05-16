import React from 'react';
import { useUser } from '@civic/auth-web3/react';
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, Wallet, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CivicAuthStatusProps {
  className?: string;
}

// Mock wallet data for demonstration
const mockWallet = {
  publicKey: '5DAAnV9zFqyhRcjgMJiTzSxw3YkWW5BbNnGPZVmkyQhS',
  network: 'devnet',
  type: 'embedded'
};

const CivicAuthStatus: React.FC<CivicAuthStatusProps> = ({ 
  className = '' 
}) => {
  const { user, isLoading } = useUser();
  // Use the mock wallet instead of accessing it from useUser
  const wallet = mockWallet;

  if (isLoading) {
    return (
      <div className={`animate-pulse flex flex-col gap-3 ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Not authenticated with Civic Auth. Please sign in to access your wallet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-full">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
        </div>
        <div>
          <div className="font-medium">Authenticated with Civic Auth</div>
          <div className="text-sm text-muted-foreground">
            Secure authentication and wallet management
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm">User ID</span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {user.id 
              ? `${user.id.substring(0, 12)}...` 
              : 'ID Available'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm">Wallet Type</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Embedded (Solana)
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm">Security</span>
          </div>
          <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">
            High
          </Badge>
        </div>
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t">
        Your healthcare identity and credentials are protected by Civic Auth's
        secure embedded wallet technology on the Solana blockchain.
      </div>
    </div>
  );
};

export default CivicAuthStatus;
