import React, { useState, useEffect, useCallback, useRef } from 'react';
import browser from 'webextension-polyfill';
import { toast } from 'react-hot-toast';

interface UserMenuProps {
  onShowAuthUI: () => void;
}

interface User {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}

interface AuthResponse {
  success: boolean;
  error?: string;
  data?: {
    isAuthenticated?: boolean;
    user?: User;
  };
}

const UserMenu: React.FC<UserMenuProps> = ({ onShowAuthUI }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check auth status on mount
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await browser.runtime.sendMessage({
        action: 'getCurrentUser'
      }) as AuthResponse;

      if (response && response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking user status:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'signOut'
      }) as AuthResponse;

      if (response && response.success) {
        setUser(null);
        toast.success('Signed out successfully');
        setIsOpen(false);
      } else {
        toast.error('Failed to sign out');
      }
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Error signing out');
    }
  }, []);

  // Toggle menu open/closed
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar / Login Button */}
      <button
        onClick={toggleMenu}
        className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
        aria-label="User menu"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : user ? (
          user.isAnonymous ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          ) : (
            <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
          )
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                {user.isAnonymous ? (
                  <div className="text-sm text-gray-700">Guest User</div>
                ) : (
                  <>
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    <div className="text-xs text-gray-500">Signed in</div>
                  </>
                )}
              </div>
              
              {user.isAnonymous && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onShowAuthUI();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Create Account
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                onShowAuthUI();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign In / Create Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu; 