// This file handles permission management for the application
// It helps with managing camera, screen-wake-lock and other permissions
// that might be needed by the Civic Auth integration

// Check if service workers are supported
const serviceWorkerSupported = 'serviceWorker' in navigator;

// Function to register our permission service worker
export const registerPermissionWorker = async () => {
  if (!serviceWorkerSupported) {
    console.log('Service workers not supported in this browser');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/permission-worker.js');
    console.log('Permission service worker registered with scope:', registration.scope);
    return true;
  } catch (error) {
    console.error('Permission service worker registration failed:', error);
    return false;
  }
};

// Function to request a specific permission using the service worker
export const requestPermission = async (permission) => {
  if (!serviceWorkerSupported || !navigator.serviceWorker.controller) {
    console.log('Service worker not active, falling back to direct permission request');
    return requestPermissionDirectly(permission);
  }
  
  return new Promise((resolve) => {
    // Create a message channel for the service worker to respond through
    const messageChannel = new MessageChannel();
    
    // Set up the message handler for responses
    messageChannel.port1.onmessage = (event) => {
      if (event.data.status === 'processing') {
        // The service worker acknowledged the request, now try direct request
        requestPermissionDirectly(permission).then(resolve);
      }
    };
    
    // Send the permission request to the service worker
    navigator.serviceWorker.controller.postMessage(
      {
        type: 'REQUEST_PERMISSION',
        permission
      },
      [messageChannel.port2]
    );
    
    // Fallback in case the service worker doesn't respond
    setTimeout(() => {
      requestPermissionDirectly(permission).then(resolve);
    }, 1000);
  });
};

// Function to directly request a permission without using the service worker
export const requestPermissionDirectly = async (permission) => {
  try {
    // Handle different permission types
    switch (permission) {
      case 'camera':
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' });
          return result.state;
        } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Try to get access to camera temporarily
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop all tracks to release the camera
          stream.getTracks().forEach(track => track.stop());
          return 'granted';
        }
        break;
        
      case 'screen-wake-lock':
        if ('wakeLock' in navigator) {
          try {
            // Try to acquire and release a wake lock
            const wakeLock = await navigator.wakeLock.request('screen');
            await wakeLock.release();
            return 'granted';
          } catch (e) {
            return 'denied';
          }
        }
        break;
        
      default:
        console.log(`Permission ${permission} not implemented`);
    }
    
    return 'unknown';
  } catch (error) {
    console.error(`Error requesting ${permission} permission:`, error);
    return 'error';
  }
};

// Function to preemptively request all permissions we might need
export const requestAllPermissions = async () => {
  const permissions = ['camera', 'screen-wake-lock'];
  const results = {};
  
  for (const permission of permissions) {
    results[permission] = await requestPermission(permission);
  }
  
  return results;
};
