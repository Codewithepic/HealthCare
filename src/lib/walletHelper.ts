import { useUser } from "@civic/auth-web3/react";

/**
 * Get wallet address from user object using available properties
 */
export const getCivicWallet = async (user?: any) => {
  try {
    if (!user) {
      console.log("No valid user for wallet lookup");
      return null;
    }

    // Extract wallet-related fields from user object
    const walletAddress = 
      user.wallet_address || 
      user.walletAddress || 
      user.wallet || 
      (user.blockchain_accounts?.solana?.address) ||
      (user.blockchain_accounts?.ethereum?.address) ||
      (user.identity?.blockchain_accounts?.solana?.address) ||
      (user.identity?.blockchain_accounts?.ethereum?.address);
    
    if (walletAddress) {
      console.log("Found wallet address in user object:", walletAddress);
      return walletAddress;
    }
    
    // If we have a sub ID, we can try to construct a placeholder wallet for demo purposes
    if (user.sub && import.meta.env.DEV) {
      // Create a deterministic wallet address from the user's sub ID for development
      const demoWallet = `demo${user.sub.slice(0, 8)}Wallet${user.sub.slice(-4)}`;
      console.log("Created demo wallet from user ID:", demoWallet);
      return demoWallet;
    }
    
    console.log("No wallet found for user");
    return null;
  } catch (error) {
    console.error("Error getting wallet:", error);
    return null;
  }
};

/**
 * Alternative way to get wallet info - we won't use gateway token in this version
 * since it might not be supported in the current Civic Auth version
 */
export const getGatewayTokenForUser = async (user?: any) => {
  try {
    if (!user) return null;
    
    // In this simplified version, we're just checking for wallet info in the user object
    return {
      wallet: user.wallet || user.walletAddress || null
    };
  } catch (error) {
    console.error("Error getting alternative wallet info:", error);
    return null;
  }
};

/**
 * Helper function to clean up and validate a wallet address string
 */
export const formatWalletAddress = (address?: string | null) => {
  if (!address) return null;
  
  // Make sure it's a proper string
  const formatted = String(address).trim();
  
  // Basic validation for Solana address (base58, should be 32-44 chars)
  if (formatted.length >= 32 && formatted.length <= 44) {
    return formatted;
  }
  
  return null;
};
