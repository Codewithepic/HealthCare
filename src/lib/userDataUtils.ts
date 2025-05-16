// Utility functions for handling user data across authentication providers

/**
 * Extracts a normalized wallet address from a Civic Auth user object
 * 
 * @param user Any type of user object from Civic Auth
 * @returns The wallet address as a string or null if not found
 */
export const extractWalletAddress = (user: any): string | null => {
  if (!user) return null;
  
  // Try various possible locations where wallet address might be stored
  // For Civic Auth, first check if wallet or walletAddress is directly available
  if (user.wallet) {
    return user.wallet;
  }
  
  if (user.walletAddress) {
    return user.walletAddress;
  }
  
  // Check in specific Civic Auth structure
  if (user.blockchain_wallet_addresses) {
    return user.blockchain_wallet_addresses.solana || 
           user.blockchain_wallet_addresses.ethereum;
  }
  
  // Check identity object for Civic Auth
  if (user.identity && user.identity.blockchain_accounts) {
    const accounts = user.identity.blockchain_accounts;
    return accounts.solana?.address || 
           accounts.ethereum?.address || 
           accounts.solana || 
           accounts.ethereum;
  }
  
  // Try various possible locations where wallet address might be stored
  return user.wallet_address || 
         user.account_address || 
         user.blockchain_addresses?.solana || 
         user.blockchain_addresses?.ethereum ||
         // Try additional possible locations
         user.blockchain_accounts?.solana?.address ||
         user.blockchain_accounts?.ethereum?.address ||
         user.wallets?.[0]?.address ||
         null;
};

/**
 * Extracts user information from different auth providers into a standard format
 * 
 * @param user User object from any auth provider
 * @param provider The name of the provider (e.g., 'civic', 'google', 'supabase')
 * @returns Normalized user data object
 */
export const normalizeUserData = (user: any, provider: string) => {
  if (!user) return null;
  
  let userData = {
    id: null,
    name: null,
    email: null,
    avatar: null,
    provider,
    wallet: null,
    originalUser: user
  };
  
  // Extract common fields based on provider
  switch (provider) {
    case 'civic':
      userData = {
        ...userData,
        id: user.sub,
        name: user.name || user.email || "Civic User",
        email: user.email,
        avatar: user.picture,
        wallet: extractWalletAddress(user)
      };
      break;
      
    case 'google':
    case 'supabase':
      userData = {
        ...userData,
        id: user.id,
        name: user.user_metadata?.name || user.email || "User",
        email: user.email,
        avatar: user.user_metadata?.avatar_url,
        wallet: null
      };
      break;
      
    default:
      // Generic fallback extraction
      userData = {
        ...userData,
        id: user.id || user.sub,
        name: user.name || user.displayName || user.email || "User",
        email: user.email,
        avatar: user.picture || user.avatar || user.photoURL,
        wallet: extractWalletAddress(user)
      };
  }
  
  return userData;
};

/**
 * Generates a consistent avatar URL based on the user's name or other identifiers
 * 
 * @param user Object containing user data
 * @returns URL for a consistent avatar image
 */
export const generateAvatarUrl = (user: {
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
  id?: string | null;
  photoURL?: string | null;
}) => {
  // If user has a photoURL, use it directly
  if (user.photoURL) {
    return user.photoURL;
  }

  // Otherwise generate a seed from user data in order of preference
  const seed = (
    user.name || 
    user.displayName || 
    user.email?.split('@')[0] || 
    user.id || 
    "healthcare-user"
  ).toLowerCase().replace(/\s+/g, '-');

  // Return a dicebear avatar with a consistent seed
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Gets a display name for the user from available data
 * 
 * @param user Object containing user data
 * @returns User display name
 */
export const getUserDisplayName = (user: {
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
}) => {
  return (
    user.name || 
    user.displayName || 
    user.email?.split('@')[0] || 
    "Healthcare User"
  );
};

/**
 * Gets the user's initials based on their name
 * 
 * @param name User's name
 * @returns User's initials (1-2 characters)
 */
export const getUserInitials = (name?: string | null) => {
  if (!name) return 'U';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
