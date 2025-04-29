import React, { useState } from 'react';
import GridBeam from './GridBeam';
import { IconBrandX, IconBrandLinkedin, IconBrandDribbble, IconBrandFacebook, IconLogout, IconSettings } from '@tabler/icons-react';
import SettingsModal from './SettingsModal';

interface ProfilePageProps {
  userData?: {
    name: string;
    email: string;
    avatar?: string;
    title?: string;
  };
  onLogout?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  userData = {
    name: '',
    email: '',
    title: ''
  },
  onLogout = () => console.log('Logout clicked')
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scanningEngine, setScanningEngine] = useState('crawl4ai');

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleEngineChange = (engine: string) => {
    console.log(`Scanning engine changed to: ${engine}`);
    setScanningEngine(engine);
    // In the future, this will save the setting to storage or context
  };

  return (
    <GridBeam className="min-h-screen w-full">
      <div className="flex flex-col items-center justify-center w-full pt-16 pb-32 relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleOpenSettings}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors shadow-sm"
            aria-label="Settings"
          >
            <IconSettings size={22} stroke={1.5} />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-8">My Profile</h1>
        
        {/* Profile Widget - Inspired by Animata Design */}
        <div className="group flex h-64 w-64 flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 shadow-sm transition-all duration-300 hover:shadow-lg relative">
          {/* Logout Button - positioned in top right corner of the profile widget */}
          <button 
            onClick={onLogout}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-red-400 transition-colors shadow-sm"
            aria-label="Logout"
          >
            <IconLogout size={20} stroke={1.5} />
          </button>
          
          <div className="relative">
            <img
              alt={userData.name}
              src={userData.avatar}
              className="h-20 w-20 rounded-full border-2 border-white/10 shadow-md duration-300 ease-in-out hover:scale-110 bg-white/5"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-zinc-800"></div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center">
            <h3 className="font-sans font-semibold text-gray-100">{userData.name}</h3>
            <p className="text-sm font-light text-gray-400">{userData.title}</p>
            <p className="text-xs text-gray-500 mt-1">{userData.email}</p>
          </div>
          <div className="mt-6 flex w-full flex-row justify-evenly rounded-3xl bg-white/5 p-3 text-gray-400">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
               className="transition-all duration-200 hover:text-blue-400 hover:scale-110">
              <IconBrandX size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className="transition-all duration-200 hover:text-blue-400 hover:scale-110">
              <IconBrandLinkedin size={18} />
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer"
               className="transition-all duration-200 hover:text-pink-400 hover:scale-110">
              <IconBrandDribbble size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
               className="transition-all duration-200 hover:text-blue-400 hover:scale-110">
              <IconBrandFacebook size={18} />
            </a>
          </div>
        </div>

        {/* Current Scanning Engine Card */}
        <div className="mt-8 w-64 p-4 rounded-lg bg-white shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-800 mb-1">Current Scanning Engine</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <p className="text-sm text-gray-600">{scanningEngine === 'crawl4ai' ? 'Crawl4AI' : 'AgentQL'}</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        currentEngine={scanningEngine}
        onEngineChange={handleEngineChange}
      />
    </GridBeam>
  );
};

export default ProfilePage; 