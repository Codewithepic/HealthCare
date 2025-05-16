import React, { useState, useEffect } from 'react';
import { useUser } from "@civic/auth-web3/react";
import { extractWalletAddress } from "@/lib/userDataUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Bug, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { getEmbeddedWalletInfo } from "@/lib/civicAuth";
import { getCivicWallet, getGatewayTokenForUser } from "@/lib/walletHelper";

interface EnhancedWalletDebuggerProps {
  userData?: any;
}

const EnhancedWalletDebugger: React.FC<EnhancedWalletDebuggerProps> = ({ userData }) => {
  const { user: civicUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [detailedResults, setDetailedResults] = useState<any>({});
  
  // Use our wallet address hook to see what it returns
  const { walletAddress, isLoading, error, refreshWalletAddress } = useWalletAddress();
  
  // Extract wallet address from both sources as well for comparison
  const walletFromCivic = extractWalletAddress(civicUser);
  const walletFromUserData = userData?.wallet || extractWalletAddress(userData);
  
  useEffect(() => {
    if (isOpen && civicUser) {
      collectDetailedInfo();
    }
  }, [isOpen, civicUser]);
  
  // Function to collect detailed information about the wallet from all possible sources
  const collectDetailedInfo = async () => {
    if (!civicUser) return;
    
    try {
      setIsRefreshing(true);
      
      // Try all the different methods to get wallet info
      const results = {
        hookResult: walletAddress,
        extractMethod: extractWalletAddress(civicUser),
        userDataMethod: userData?.wallet || null,
        civicWalletMethod: await getCivicWallet(civicUser),
        embeddedWalletMethod: null as any,
        gatewayTokenMethod: null as any,
        userObject: {
          sub: civicUser.sub,
          blockchain_accounts: civicUser.blockchain_accounts,
          wallet: civicUser.wallet,
          walletAddress: civicUser.walletAddress,
          // Add other relevant fields from user object
        }
      };
      
      try {
        const walletInfo = await getEmbeddedWalletInfo(civicUser);
        results.embeddedWalletMethod = walletInfo.data?.publicKey || null;
      } catch (e) {
        console.error("Error getting embedded wallet info:", e);
      }
      
      try {
        const gatewayToken = await getGatewayTokenForUser(civicUser);
        results.gatewayTokenMethod = gatewayToken?.wallet || null;
      } catch (e) {
        console.error("Error getting gateway token:", e);
      }
      
      setDetailedResults(results);
    } catch (e) {
      console.error("Error collecting wallet info:", e);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Function to manually retry getting the wallet address from Civic
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWalletAddress();
      await collectDetailedInfo();
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

  return (
    <Card className="my-4 border-dashed border-yellow-500 bg-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-yellow-700">
          <Bug className="mr-2 h-5 w-5" />
          Enhanced Wallet Debugger 
          {walletAddress ? (
            <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="ml-2 h-5 w-5 text-red-500" />
          )}
        </CardTitle>
        <CardDescription className="text-yellow-600">
          This component helps debug wallet address detection issues with enhanced diagnostics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Active Wallet Address:</p>
              <p className="text-sm font-mono bg-yellow-100 p-1 rounded">
                {isLoading ? (
                  "Loading..."
                ) : walletAddress ? (
                  walletAddress
                ) : (
                  <span className="text-red-500">No wallet address detected</span>
                )}
              </p>
              
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-8 gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full flex justify-between">
              <span>Detailed Wallet Information</span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2">
            <div className="rounded border p-2 text-xs">
              <h3 className="font-medium">Wallet Detection Methods:</h3>
              <div className="mt-1 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1 text-left">Method</th>
                      <th className="px-2 py-1 text-left">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-t px-2 py-1">useWalletAddress Hook</td>
                      <td className="border-t px-2 py-1 font-mono">
                        {isLoading ? "Loading..." : walletAddress || "null"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-t px-2 py-1">extractWalletAddress</td>
                      <td className="border-t px-2 py-1 font-mono">
                        {detailedResults.extractMethod || "null"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-t px-2 py-1">getUserData.wallet</td>
                      <td className="border-t px-2 py-1 font-mono">
                        {detailedResults.userDataMethod || "null"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-t px-2 py-1">getCivicWallet</td>
                      <td className="border-t px-2 py-1 font-mono">
                        {isRefreshing ? "Loading..." : detailedResults.civicWalletMethod || "null"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-t px-2 py-1">getEmbeddedWalletInfo</td>
                      <td className="border-t px-2 py-1 font-mono">
                        {isRefreshing ? "Loading..." : detailedResults.embeddedWalletMethod || "null"}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-t px-2 py-1">getGatewayToken</td>
                      <td className="border-t px-2 py-1 font-mono">
                        {isRefreshing ? "Loading..." : detailedResults.gatewayTokenMethod || "null"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded border p-2 text-xs">
              <h3 className="font-medium">User Object (Relevant Fields):</h3>
              <pre className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                {civicUser ? formatJson(detailedResults.userObject || {}) : "No user data available"}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default EnhancedWalletDebugger;
