import { useState, useEffect, useCallback, useMemo } from 'react';
import { tokenManager } from '../services/api';

export interface AuthState {
  isAuthenticated: boolean | null;
  loading: boolean;
}

let authStateListeners: Array<(state: AuthState) => void> = [];
let globalAuthState: AuthState = {
  isAuthenticated: null,
  loading: true,
}
let authInitialized = false;

// Global function to update auth state and notify all listeners
const updateGlobalAuthState = (newState: Partial<AuthState>) => {
  const prev = globalAuthState;
  globalAuthState = { ...globalAuthState, ...newState };
  
  // Only notify if state actually changed
  if (prev.isAuthenticated !== globalAuthState.isAuthenticated || prev.loading !== globalAuthState.loading) {
    // Use microtask to batch notifications
    queueMicrotask(() => {
      authStateListeners.forEach(listener => listener(globalAuthState));
    });
  }
};

// Synchronous initial auth check — no DB call, just checks local storage
const checkAuthSync = (): boolean => {
  const token = tokenManager.getToken();
  const userData = tokenManager.getUserData();
  return !!(token && userData);
};

// Fast synchronous initialization — runs once, no network calls
const initializeAuth = () => {
  if (authInitialized) return;
  authInitialized = true;
  
  const isAuthenticated = checkAuthSync();
  globalAuthState = { isAuthenticated, loading: false };
  
  // Defer socket initialization to avoid blocking the auth check
  if (isAuthenticated) {
    const token = tokenManager.getToken();
    if (token) {
      // Lazy-load socket service to avoid circular dependency and reduce initial bundle
      requestIdleCallback(() => {
        import('../services/socketService').then(({ default: socketService }) => {
          socketService.updateToken(token);
        });
      }, { timeout: 2000 });
    }
  }
};

// Run synchronous check immediately on module load
initializeAuth();

// Global function to check auth status (called on focus/login/register)
const checkGlobalAuthStatus = async () => {
  try {
    const isUserAuthenticated = checkAuthSync();
    
    if (globalAuthState.isAuthenticated !== isUserAuthenticated) {
      updateGlobalAuthState({ isAuthenticated: isUserAuthenticated, loading: false });
      
      if (isUserAuthenticated) {
        const token = tokenManager.getToken();
        if (token) {
          const { default: socketService } = await import('../services/socketService');
          await socketService.updateToken(token);
        }
      } else {
        const { default: socketService } = await import('../services/socketService');
        socketService.disconnect();
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    if (globalAuthState.isAuthenticated !== false) {
      updateGlobalAuthState({ isAuthenticated: false, loading: false });
      const { default: socketService } = await import('../services/socketService');
      socketService.disconnect();
    }
  }
};

// Function to trigger immediate auth check (called after login/register)
export const refreshAuthStatus = () => {
  checkGlobalAuthStatus();
};

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState);

  const handleAuthStateChange = useCallback((newState: AuthState) => {
    setAuthState(prev => {
      // Avoid re-render if state hasn't changed
      if (prev.isAuthenticated === newState.isAuthenticated && prev.loading === newState.loading) {
        return prev;
      }
      return newState;
    });
  }, []);

  useEffect(() => {
    // Add this component as a listener
    authStateListeners.push(handleAuthStateChange);

    // Sync with current global state in case it changed
    if (authState.isAuthenticated !== globalAuthState.isAuthenticated || 
        authState.loading !== globalAuthState.loading) {
      setAuthState(globalAuthState);
    }

    const isFirstListener = authStateListeners.length === 1;

    if (isFirstListener) {
      // Set up focus listener with debouncing
      let focusTimeout: ReturnType<typeof setTimeout>;
      const handleFocus = () => {
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => checkGlobalAuthStatus(), 100);
      };

      window.addEventListener('focus', handleFocus);

      return () => {
        authStateListeners = authStateListeners.filter(listener => listener !== handleAuthStateChange);
        window.removeEventListener('focus', handleFocus);
        clearTimeout(focusTimeout);
      };
    }

    // Cleanup function for subsequent components
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== handleAuthStateChange);
    };
  }, [handleAuthStateChange]);

  return authState;
};

// requestIdleCallback polyfill for browsers that don't support it
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  (window as any).requestIdleCallback = (cb: Function, options?: { timeout: number }) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1);
  };
}

export default useAuth;
