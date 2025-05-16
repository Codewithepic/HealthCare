// NOTE: This file is not used in Vite projects and should be removed.
// Sentry initialization has been moved to src/main.tsx
// This file is kept only for reference if migrating to Next.js

import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { initSentry } from '@/lib/sentry';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize Sentry once on app load
  useEffect(() => {
    initSentry();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
