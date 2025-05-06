import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ProfileHeaderProps {
  name: string;
  email: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, email }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="relative h-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="absolute -bottom-10 left-3">
        <Avatar className="h-20 w-20 border-4 border-white">
          <AvatarImage src={`https://avatar.vercel.sh/${email}`} alt={name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ProfileHeader; 