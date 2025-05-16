import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/browser';
import { trackError } from './errorTracking';

// Track initialization state
let isInitialized = false;

export const initSentry = () => {
  // Skip initialization if already done
  if (isInitialized) {
    return;
  }

  try {
    // For Vite, use import.meta.env instead of process.env
    const dsn = import.meta.env.VITE_SENTRY_DSN || '';
    
    // Don't initialize if no DSN is provided
    if (!dsn) {
      console.log('Sentry initialization skipped: No DSN provided');
      return;
    }
    
    Sentry.init({
      dsn,
      integrations: [
        // Add browser tracing integration
        browserTracingIntegration(),
      ],
      // Disable debug in production
      debug: import.meta.env.MODE !== 'production',
      environment: import.meta.env.MODE,
      // Adjust sample rates based on environment
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 1.0,
      // Don't send errors to Sentry during local development
      enabled: import.meta.env.MODE !== 'development',
    });
    
    isInitialized = true;
    console.log(`Sentry initialized in ${import.meta.env.MODE} environment`);
  } catch (error) {
    console.error('Sentry initialization failed:', error);
  }
};

export const captureException = (error: unknown, context?: Record<string, any>) => {
  // Check if Sentry is initialized before capturing
  if (!isInitialized) {
    // Use our custom error tracking when Sentry is not available
    trackError(error, context);
    return;
  }

  try {
    Sentry.captureException(error, {
      contexts: context ? { additionalInfo: context } : undefined,
    });
  } catch (sentryError) {
    // Fallback to console if Sentry capture fails
    console.error('Failed to capture error with Sentry:', sentryError);
    console.error('Original error:', error);
    // Use our custom error tracking as fallback
    trackError(error, context);
  }
};
