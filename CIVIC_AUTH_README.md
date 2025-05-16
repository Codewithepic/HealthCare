# Healthcare Identity Platform with Civic Auth

This project demonstrates a secure healthcare identity platform powered by Civic Auth, using embedded wallets to provide authentication and blockchain-based security for users.

## Project Overview

The Healthcare Identity Platform showcases how Civic Auth can be integrated into a healthcare application to provide:

1. **Secure Authentication** - Using Civic Auth for secure login without passwords
2. **Embedded Wallets** - Creating and managing blockchain wallets for users without complex setup
3. **Identity Management** - Storing identity information securely on the blockchain
4. **Privacy-Preserving Verification** - Allowing users to prove aspects of their identity without revealing all information

## Civic Auth Integration

This project uses the `@civic/auth-web3` package to integrate Civic's authentication system with embedded Solana wallets. The integration provides:

- A simple sign-in flow that creates embedded wallets for users
- Secure wallet management without exposing private keys to users
- Blockchain-based identity that can be used for verifiable credentials

## How it Works

1. **User Authentication**: 
   - Users click the "Sign In with Civic Auth" button
   - They complete the Civic authentication flow
   - An embedded wallet is automatically created for them

2. **Embedded Wallet**:
   - Users can view their wallet address and balance
   - The wallet is securely managed by Civic's infrastructure
   - No private key management is required by the user

3. **Identity Verification**:
   - The platform could be extended to verify healthcare credentials
   - Verifications would be stored as attestations on the blockchain
   - Users control what information they share and when

## Using Civic Auth in Components

To use Civic Auth in your components, import the `useUser` hook from `@civic/auth/react`:

```tsx
import { useUser } from '@civic/auth/react';

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useUser();
  
  // Check if user is authenticated
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    return (
      <div>
        <p>Welcome, {user.email || 'User'}!</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }
  
  // Handle login
  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <button onClick={handleLogin}>
      Sign in with Civic
    </button>
  );
}
```

## Key Components

- **CivicAuthProvider**: Wraps the application to provide authentication context
- **AuthFlow**: Manages the authentication flow with Civic Auth
- **EmbeddedWalletCard**: Displays the user's embedded wallet information
- **CivicAuthStatus**: Shows the current authentication status

## Installation and Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `VITE_CIVIC_APP_ID`: Your Civic App ID (from the Civic Developer Portal)
4. Run the development server: `npm run dev`

## Demo Video

[Link to demo video will be added here]

## Future Extensions

The Healthcare Identity Platform could be extended to include:

- **Verifiable Credentials**: Healthcare credentials that can be verified without revealing all information
- **Prescription Management**: Securely managing prescriptions on the blockchain
- **Insurance Verification**: Automated insurance verification through blockchain attestations
- **Patient Records**: Secure, patient-controlled health records with selective sharing

## Troubleshooting

If you encounter issues with Civic Auth:

1. Check the browser console for errors
2. Verify the Civic App ID in your `.env` file
3. Ensure the callback URL is properly configured (`/auth/callback`)
4. Check that `CivicAuthProvider` is correctly set up in `App.tsx`

## About Civic Auth

Civic Auth provides a simple, flexible, and fast way to integrate authentication into applications. With Auth, developers can enable familiar sign-in options while offering embedded wallets and unlocking blockchain benefits for users.

For more information about Civic Auth, visit [civic.com](https://civic.com).
