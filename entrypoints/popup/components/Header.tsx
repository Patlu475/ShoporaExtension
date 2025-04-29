import React from 'react';

interface HeaderProps {
  // No props needed as the header is always visible
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-center h-14 p-4 bg-zinc-900 border-b border-zinc-800 shadow-md w-full">
      <div className="flex items-center justify-center w-full">
        <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">ShopBot</span>
      </div>
    </header>
  );
};

export default Header; 