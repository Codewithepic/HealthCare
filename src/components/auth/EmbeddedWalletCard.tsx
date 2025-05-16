import React, { useState } from 'react';
import { useUser } from '@civic/auth/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wallet, Copy, Check, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmbeddedWalletCardProps {
  className?: string;
}

// Mock wallet data for demonstration purposes
// In a real implementation, this would come from the Civic Auth Web3 SDK
const mockWallet = {
  publicKey: '5DAAnV9zFqyhRcjgMJiTzSxw3YkWW5BbNnGPZVmkyQhS',
  network: 'devnet',
  type: 'embedded'
};

const EmbeddedWalletCard: React.FC<EmbeddedWalletCardProps> = ({ 
  className = '' 
}) => {
  const { user, isLoading } = useUser();
  // Use mock wallet data instead of directly accessing it from useUser
  const wallet = mockWallet;
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check wallet balance
  const checkBalance = async () => {
    if (!wallet) return;
    
    setChecking(true);
    setError(null);
    
    try {
      // Simulating a balance check - in a real implementation, 
      // you would use Solana Web3.js or similar to check the actual balance
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBalance('0.05 SOL');
    } catch (err) {
      setError('Failed to check balance');
      console.error('Balance check error:', err);
    } finally {
      setChecking(false);
    }
  };
  if (!user) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <CardTitle>Embedded Wallet</CardTitle>
          <CardDescription>Sign in with Civic Auth to access your embedded wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to authenticate with Civic Auth to access your wallet
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Civic Embedded Wallet</CardTitle>
            <CardDescription>Your secure wallet powered by Civic Auth</CardDescription>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900 rounded-full">
            <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Your Wallet Address</Label>
          <div className="flex gap-2">
            <Input 
              id="wallet-address" 
              value={wallet.publicKey}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
              title="Copy wallet address"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your unique Solana blockchain wallet address
          </p>
        </div>
        
        <Tabs defaultValue="balance">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance" className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Current Balance</h3>
                <p className="text-2xl font-bold">
                  {balance ? balance : '---'}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={checkBalance} 
                disabled={checking}
              >
                {checking ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Check
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-muted-foreground">
              Your embedded wallet is managed securely by Civic Auth
            </p>
          </TabsContent>
          
          <TabsContent value="security" className="pt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium">Security Features</h3>
                </div>
                
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Embedded wallet security</span>
                    <span className="ml-auto text-xs text-green-600">Active</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Key recovery mechanism</span>
                    <span className="ml-auto text-xs text-green-600">Active</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Phishing-resistant login</span>
                    <span className="ml-auto text-xs text-green-600">Active</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Civic's embedded wallet technology secures your digital assets and identity
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <p className="text-xs text-center w-full text-muted-foreground">
          Powered by Civic Auth Web3 with an embedded Solana wallet
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmbeddedWalletCard;
