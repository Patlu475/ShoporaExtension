import React, { useEffect, useState } from 'react';
import { MessageSquare, Share2, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { auth } from '../../../services/firebase/config';

interface ProfileCardProps {
  name: string;
  email: string;
  onLogout: () => void;
  stats: {
    productsScanned: number;
    wishlists: number;
    notifications: number;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name: initialName, email, onLogout, stats }) => {
  const [displayName, setDisplayName] = useState(initialName);

  useEffect(() => {
    const fetchUserName = async () => {
      if (auth?.currentUser) {
        // Get the display name from Firebase Auth
        const firebaseName = auth.currentUser.displayName;
        if (firebaseName) {
          setDisplayName(firebaseName);
        }
      }
    };

    fetchUserName();
  }, []);

  return (
    <div className="px-2 pt-12 pb-2">
      <Card>
        <CardHeader className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{displayName}</CardTitle>
              <CardDescription className="text-xs">{email}</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={onLogout}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Products Scanned</div>
              <div className="text-base font-bold">{stats.productsScanned}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Wishlists</div>
              <div className="text-base font-bold">{stats.wishlists}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Notifications</div>
              <div className="text-base font-bold">{stats.notifications}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCard; 