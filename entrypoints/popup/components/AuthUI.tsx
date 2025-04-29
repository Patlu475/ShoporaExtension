import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import browser from 'webextension-polyfill';
import { cn } from '../utils/cn';

interface AuthUIProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface AuthResponse {
  success: boolean;
  error?: string;
}

const AuthUI: React.FC<AuthUIProps> = ({ onSuccess, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle between login and signup
  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setError(null);
  }, []);

  // Handle authentication
  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      // Send authentication request
      const action = isLogin ? 'signIn' : 'signUp';
      const response = await browser.runtime.sendMessage({
        action,
        email,
        password
      }) as AuthResponse;

      if (response && response.success) {
        toast.success(isLogin ? 'Signed in successfully!' : 'Account created successfully!');
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = response?.error || `Failed to ${isLogin ? 'sign in' : 'create account'}`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(`Error during ${isLogin ? 'sign in' : 'sign up'}`);
      toast.error(`Error during ${isLogin ? 'sign in' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLogin, onSuccess]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-6">
        {isLogin ? 'Sign in to ShopBot' : 'Create a ShopBot Account'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isLogin ? "Your password" : "Create a password (min 6 characters)"}
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-2 px-4 rounded-md text-white font-medium",
            isLoading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={toggleAuthMode}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          disabled={isLoading}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>

      {onCancel && (
        <div className="mt-4 text-center">
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthUI; 