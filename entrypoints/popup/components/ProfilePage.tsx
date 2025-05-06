import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import ProfileHeader from './profile/ProfileHeader';
import ProfileCard from './profile/ProfileCard';
import AccountTab from './profile/AccountTab';
import PreferencesTab from './profile/PreferencesTab';
import ActivityTab from './profile/ActivityTab';

interface ProfilePageProps {
  userData: {
    email?: string;
    name?: string;
  };
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, onLogout }) => {
  const { name = 'User', email = 'user@example.com' } = userData;

  const stats = {
    productsScanned: 128,
    wishlists: 4,
    notifications: 12
  };

  return (
    <div className="flex flex-col h-[600px] w-[350px]">
      <ProfileHeader name={name} email={email} />
      
      <ProfileCard
        name={name}
        email={email}
        onLogout={onLogout}
        stats={stats}
      />

      <div className="flex-1 px-2 pb-2">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full h-8">
            <TabsTrigger value="account" className="flex-1 text-xs">Account</TabsTrigger>
            <TabsTrigger value="preferences" className="flex-1 text-xs">Preferences</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 text-xs">Activity</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[calc(600px-260px)]">
            <TabsContent value="account" className="mt-2">
              <AccountTab />
            </TabsContent>
            <TabsContent value="preferences" className="mt-2">
              <PreferencesTab />
            </TabsContent>
            <TabsContent value="activity" className="mt-2">
              <ActivityTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage; 