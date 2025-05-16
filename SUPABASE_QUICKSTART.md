# Quick Supabase Setup for Local Development

This quick guide will help you set up Supabase for local development of the Healthcare Identity Platform.

## 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com/) and sign in
2. Click "New Project"
3. Fill in the project details:
   - Name: Healthcare Local Dev
   - Database Password: (create a secure password)
   - Region: (choose a region close to you)
4. Click "Create Project" and wait for it to initialize

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to "Project Settings" > "API"
2. Copy the following:
   - Project URL (under "Project URL")
   - anon/public key (under "Project API keys")

## 3. Configure Your .env File

1. In your project folder, open or create a `.env` file
2. Add the following entries:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_CIVIC_APP_ID=037c6523-82a9-4f98-b9f0-c3b4d72b80cd
   ```
3. Replace `your_project_url` and `your_anon_key` with your actual values
4. Save the file

## 4. Setup Basic Tables

1. In your Supabase project, go to "SQL Editor"
2. Run the following SQL to create basic tables:

```sql
-- Create users profile table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  role TEXT DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## 5. Restart Your Development Server

After completing these steps, restart your development server to apply the changes:

```
npm run dev
```

Now your local development environment should be properly connected to Supabase!

## Troubleshooting

If you still see Supabase warning messages, double-check:
1. Your `.env` file has the correct values
2. You've restarted your development server
3. The URL and anon key are properly formatted (no extra spaces, etc.)

For more advanced Supabase setup, including authentication with Google and Civic ID, see the full [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md) guide.
