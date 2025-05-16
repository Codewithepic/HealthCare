import { useState, useEffect } from 'react';
import { useUser } from '@civic/auth-web3/react';
import { getEmbeddedWalletInfo } from '@/lib/civicAuth';
import { extractWalletAddress } from '@/lib/userDataUtils';
import { getCivicWallet, getGatewayTokenForUser, formatWalletAddress } from '@/lib/walletHelper';

/**
 * Custom hook to get the user's wallet address from Civic Auth
 * This hook handles all the complexities of extracting the wallet address
 * and provides a simple interface for components to use
 */
export const useWalletAddress = () => {
  const { user } = useUser();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!user) {
        setWalletAddress(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Attempting to get wallet address for user:', user);
        
        // Try multiple methods to get the wallet address
        let address = null;
        
        // Method 1: Try to extract it directly from user object
        address = extractWalletAddress(user);
        console.log('Method 1 (extractWalletAddress):', address);
        
        // Method 2: Try to use the Civic wallet API directly
        if (!address) {
          address = await getCivicWallet(user);
          console.log('Method 2 (getCivicWallet):', address);
        }
        
        // Method 3: Try to get it from the embedded wallet info
        if (!address) {
          const walletInfo = await getEmbeddedWalletInfo(user);
          address = walletInfo.data?.publicKey || null;
          console.log('Method 3 (getEmbeddedWalletInfo):', address);
        }
        
        // Method 4: Try gateway token approach
        if (!address) {
          const gatewayToken = await getGatewayTokenForUser(user);
          if (gatewayToken && 'wallet' in gatewayToken) {
            address = gatewayToken.wallet as string;
          }
          console.log('Method 4 (getGatewayTokenForUser):', address);
        }
        
        // Use fallback address for development if needed
        if (!address && import.meta.env.DEV) {
          // In development, if all methods failed, use a mock address for testing
          address = '5DAAnV9zFqyhRcjgMJiTzSxw3YkWW5BbNnGPZVmkyQhS';
          console.log('Using fallback development wallet address');
        }
        
        // Format and validate the wallet address
        const formattedAddress = formatWalletAddress(address);
        
        console.log('Final useWalletAddress hook result:', formattedAddress);
        setWalletAddress(formattedAddress);
        setError(formattedAddress ? null : 'Could not retrieve wallet address');
      } catch (e) {
        console.error('Error in useWalletAddress hook:', e);
        setError('Failed to fetch wallet address');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletAddress();
  }, [user]);

  return { 
    walletAddress, 
    isLoading,
    error,
    // Allow manually refreshing the wallet address
    refreshWalletAddress: async () => {
      if (!user) return null;
      
      setIsLoading(true);
      
      try {
        // Try all methods again
        let address = await getCivicWallet(user);
        
        if (!address) {
          const walletInfo = await getEmbeddedWalletInfo(user);
          address = walletInfo.data?.publicKey || null;
        }
        
        if (!address) {
          address = extractWalletAddress(user);
        }
        
        // Format and validate
        const formattedAddress = formatWalletAddress(address);
        
        setWalletAddress(formattedAddress);
        setError(formattedAddress ? null : 'Could not retrieve wallet address');
        return formattedAddress;
      } catch (e) {
        console.error('Error refreshing wallet address:', e);
        setError('Failed to refresh wallet address');
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  };
};
