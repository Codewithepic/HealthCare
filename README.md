# Healthcare Identity Platform

A secure healthcare identity platform built with blockchain-based authentication using Civic Auth.

## Features

- **Secure Authentication**: Powered by Civic Auth with blockchain-based identity
- **Embedded Wallets**: Self-sovereign identity with embedded blockchain wallets
- **Healthcare Profiles**: Secure storage of healthcare information
- **Access Control**: Granular permissions for healthcare data sharing
- **Provider Verification**: Validation of healthcare provider credentials

## Local Development Setup

### Prerequisites

- Node.js 16+ and npm
- [Supabase Account](https://supabase.com) (free tier works fine)
- [Civic Developer Account](https://www.civic.com/developers/) (for full functionality)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Healthcare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CIVIC_APP_ID=037c6523-82a9-4f98-b9f0-c3b4d72b80cd
   ```
   
   For Supabase setup, follow the [Supabase Quick Start Guide](./SUPABASE_QUICKSTART.md).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   
   Navigate to http://localhost:5173 in your web browser.

## Handling Common Errors

### Civic Auth Errors

If you see "Sign-in aborted by user" errors, this is usually because the authentication popup was closed before completion. This is expected behavior and not an application error.

### Supabase Connection Issues

If you see warnings about Supabase URL or anon key, make sure you've:
1. Created a Supabase project
2. Added the correct values to your `.env` file
3. Restarted your development server after making changes

## Project Structure

- `/src` - Application source code
  - `/components` - React components
  - `/lib` - Utility functions and service integrations
  - `/types` - TypeScript type definitions
- `/public` - Static assets

## Additional Documentation

- [Civic Auth Implementation Guide](./CIVIC_AUTH_IMPLEMENTATION.md)
- [Civic Auth Guide](./CIVIC_AUTH_GUIDE.md)
- [Civic Wallet Implementation](./CIVIC_WALLET_IMPLEMENTATION.md)
- [Supabase Auth Setup](./SUPABASE_AUTH_SETUP.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
#   H e a l t h C a r e  
 