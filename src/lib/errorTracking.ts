// Simple error tracking utility as a fallback for when Sentry isn't configured
// This can be used throughout the app to track errors consistently

/**
 * Track an error with useful context
 * @param error The error object or message
 * @param context Additional information about where/how the error occurred
 */
export const trackError = (error: unknown, context?: Record<string, any>) => {
  // Always log to console
  const errorMsg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  console.error('Error tracked:', {
    message: errorMsg,
    stack,
    ...context,
    timestamp: new Date().toISOString(),
  });

  // Store in localStorage for debugging (limited to last 10 errors)
  try {
    const storedErrors = JSON.parse(localStorage.getItem('healthcareErrors') || '[]');
    const newError = {
      message: errorMsg,
      stack: stack?.slice(0, 500), // Truncate stack for storage
      context,
      timestamp: new Date().toISOString(),
    };
    
    // Keep only the 10 most recent errors
    storedErrors.unshift(newError);
    if (storedErrors.length > 10) {
      storedErrors.pop();
    }
    
    localStorage.setItem('healthcareErrors', JSON.stringify(storedErrors));
  } catch (storageError) {
    console.error('Failed to store error in localStorage:', storageError);
  }
  
  // In a real app, you might want to send these to your server
  // if Sentry isn't available
  
  return errorMsg;
};

/**
 * Get stored errors for debugging
 */
export const getStoredErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('healthcareErrors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Clear stored errors
 */
export const clearStoredErrors = () => {
  localStorage.removeItem('healthcareErrors');
};
