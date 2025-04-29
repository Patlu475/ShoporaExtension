import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { auth } from './config';

/**
 * Service to handle Firebase authentication
 */
export class AuthService {
  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the user credentials
   */
  async signIn(email: string, password: string) {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user) {
        throw new Error('Authentication failed: No user returned');
      }
      return userCredential;
    } catch (error) {
      console.error('Error signing in:', error);
      if (error instanceof Error) {
        // Handle specific Firebase auth errors
        if (error.message.includes('auth/invalid-email')) {
          throw new Error('Invalid email address');
        } else if (error.message.includes('auth/user-disabled')) {
          throw new Error('This account has been disabled');
        } else if (error.message.includes('auth/user-not-found')) {
          throw new Error('No account found with this email');
        } else if (error.message.includes('auth/wrong-password')) {
          throw new Error('Incorrect password');
        }
      }
      throw error;
    }
  }
  
  /**
   * Create a new user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the user credentials
   */
  async signUp(email: string, password: string) {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (!userCredential.user) {
        throw new Error('Account creation failed: No user returned');
      }
      return userCredential;
    } catch (error) {
      console.error('Error signing up:', error);
      if (error instanceof Error) {
        // Handle specific Firebase auth errors
        if (error.message.includes('auth/email-already-in-use')) {
          throw new Error('This email is already registered');
        } else if (error.message.includes('auth/invalid-email')) {
          throw new Error('Invalid email address');
        } else if (error.message.includes('auth/operation-not-allowed')) {
          throw new Error('Email/password accounts are not enabled');
        } else if (error.message.includes('auth/weak-password')) {
          throw new Error('Password is too weak');
        }
      }
      throw error;
    }
  }
  
  /**
   * Sign out the current user
   * @returns Promise
   */
  async signOut() {
    try {
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  /**
   * Get the current user
   * @returns Current user or null if not signed in
   */
  getCurrentUser(): User | null {
    return auth ? auth.currentUser : null;
  }
  
  /**
   * Listen for auth state changes
   * @param callback Callback function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      return () => {}; // Return a no-op unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Check if a user is currently authenticated
   * @returns Promise<boolean> indicating if user is authenticated
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      // Get the current user
      const user = this.getCurrentUser();
      
      // If user is null, they're not authenticated
      if (!user) {
        return false;
      }
      
      // Verify the token is still valid
      if (auth) {
        try {
          await auth.currentUser?.getIdToken(true);
          return true;
        } catch (error) {
          console.error('Error refreshing token:', error);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService(); 