# Supabase Authentication Configuration Guide

This guide will help you set up Google OAuth and Civic ID authentication in your Supabase project.

## 0. Setting Up Your Supabase Project

Before configuring any authentication providers, you need to create a Supabase project:

1. Go to [Supabase](https://app.supabase.com/) and sign in or create an account
2. Click "New Project"
3. Fill in the project details:
   - Name: Healthcare Identity Platform
   - Database Password: (create a secure password)
   - Region: (choose a region close to your users)
4. Click "Create Project" and wait for it to initialize (this may take a few minutes)
5. Once your project is ready, go to "Project Settings" > "API"
6. Copy the "Project URL" and "anon/public" key values
7. Update your `.env` file with these values:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 1. Google OAuth Setup

### Step 1: Create OAuth credentials in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application" as the application type
6. Add your app's domain to "Authorized JavaScript origins"
7. Add your callback URL to "Authorized redirect URIs":
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   - For local development, also add:
   ```
   http://localhost:5173/auth/callback
   ```
8. Click "Create" and note down your Client ID and Client Secret

### Step 2: Configure Google OAuth in Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and click "Enable"
5. Enter the Client ID and Client Secret from Google Cloud Console
6. Save the configuration

## 2. Civic ID Setup (Custom OAuth Provider)

Since Civic ID is not a built-in provider in Supabase, you will need to set it up as a custom OAuth provider:

### Step 1: Register your app with Civic
1. Visit the [Civic Developer Portal](https://www.civic.com/developers/)
2. Create a new application
3. Configure your Redirect URL:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   - For local development, also add:
   ```
   http://localhost:5173/auth/callback
   ```
4. Note down your Client ID and Client Secret

### Step 2: Configure Custom OAuth Provider in Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers" > "Custom OAuth Providers"
4. Click "Add Custom OAuth Provider"
5. Configure the provider with the following settings:
   - Name: Civic
   - Client ID: [Your Civic Client ID]
   - Client Secret: [Your Civic Client Secret]
   - Authorization URL: https://api.civic.com/oauth2/authorize
   - Token URL: https://api.civic.com/oauth2/token
   - User Info URL: https://api.civic.com/oauth2/userinfo
   - User ID Path: id
   - User Name Path: username
   - User Email Path: email
6. Save the configuration

## 3. Update Environment Variables

After setting up your providers, update your `.env` file with your Supabase URL and anonymous key:

```
VITE_SUPABASE_URL=https://[YOUR_SUPABASE_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

You can find these values in your Supabase project under Project Settings > API.

## 4. CORS Configuration

For development, you need to configure CORS settings in your Supabase project:

1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to "Authentication" > "URL Configuration"
4. Add your development URL to "Site URL" (e.g., `http://localhost:5173`)
5. Add your production domain when you deploy

## 5. Testing Authentication

1. Start your application with `npm run dev`
2. Navigate to the login page
3. Click on the Google or Civic ID buttons to test authentication
4. After successful authentication, you should be redirected back to your application
5. Verify that the user is authenticated by checking for the user's information

## Troubleshooting

- If OAuth authentication fails, check your browser console for errors
- Verify that your redirect URLs are correctly configured in both your OAuth provider and Supabase
- Ensure your environment variables are correctly set
- Check that your OAuth credentials are correctly entered in the Supabase dashboard
- Make sure your Supabase URL does not have a trailing slash

### Common Errors

1. **"Failed to construct 'URL': Invalid URL"**
   - Cause: Missing or invalid Supabase URL in your environment variables
   - Solution: Make sure your `.env` file has a valid VITE_SUPABASE_URL

2. **"Authentication provider error"**
   - Cause: OAuth provider is not properly configured
   - Solution: Double-check your provider settings in Supabase and the OAuth provider

3. **"Redirect URI mismatch"**
   - Cause: The redirect URI in your OAuth provider doesn't match the one Supabase is using
   - Solution: Make sure the redirect URIs are exactly the same

4. **"Invalid state: The state passed in the URL doesn't match the state that was generated when creating the sign-in link"**
   - Cause: Security token mismatch, often due to cookie issues
   - Solution: Clear cookies or try in an incognito window
