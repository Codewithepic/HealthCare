import React, { useState } from 'react';
import { useUser } from "@civic/auth/react";
import { extractWalletAddress } from "@/lib/userDataUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Bug, RefreshCw } from "lucide-react";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { getEmbeddedWalletInfo } from "@/lib/civicAuth";

interface WalletDebuggerProps {
  userData?: any;
}

const WalletDebugger: React.FC<WalletDebuggerProps> = ({ userData }) => {
  const { user: civicUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use our wallet address hook to see what it returns
  const { walletAddress, isLoading, error, refreshWalletAddress } = useWalletAddress();
  
  // Extract wallet address from both sources as well for comparison
  const walletFromCivic = extractWalletAddress(civicUser);
  const walletFromUserData = userData?.wallet || extractWalletAddress(userData);
  
  // Function to manually retry getting the wallet address from Civic
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWalletAddress();
      
      // Also try direct API call
      if (civicUser) {
        const walletInfo = await getEmbeddedWalletInfo(civicUser);
        console.log("Direct wallet API call result:", walletInfo);
      }
    } catch (e) {
      console.error("Error refreshing wallet:", e);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return "Error formatting object";
    }
  };
  
  if (!civicUser && !userData) {
    return null;
  }
  
  return (
    <Card className="mt-4 border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Wallet Debug Information
        </CardTitle>
        <CardDescription className="text-xs">
          Developer tool to diagnose wallet connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xs">        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Wallet Address Status</div>
            <Button              size="sm" 
              variant="outline" 
              className="h-7 text-xs gap-1" 
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-1 px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded">
            <div>
              <strong className="text-green-600">From useWalletAddress hook:</strong> {isLoading ? '(Loading...)' : walletAddress || 'Not detected'}
            </div>
            <div>
              <strong>From Civic Auth:</strong> {walletFromCivic || 'Not detected'}
            </div>
            <div>
              <strong>From User Data:</strong> {walletFromUserData || 'Not detected'}
            </div>
            {error && (
              <div className="text-red-500 mt-1">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between text-xs"
              >
                Show Raw User Objects
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-auto">
              <div className="p-2 mt-2 bg-slate-100 dark:bg-slate-900 rounded max-h-60 overflow-auto">
                <h4 className="font-medium mb-1">Civic User Object:</h4>
                <pre className="whitespace-pre-wrap break-all">
                  {civicUser ? formatJson(civicUser) : 'Not available'}
                </pre>
                
                <h4 className="font-medium mb-1 mt-3">User Data Object:</h4>
                <pre className="whitespace-pre-wrap break-all">
                  {userData ? formatJson(userData) : 'Not available'}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDebugger;
