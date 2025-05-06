import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const PreferencesTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Preferences</CardTitle>
        <CardDescription className="text-xs">Customize your experience.</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium mb-1">Notifications</div>
            <div className="flex items-center justify-between">
              <div className="text-xs">Email Notifications</div>
              <Button variant="outline" size="sm" className="h-6 text-xs">Configure</Button>
            </div>
          </div>
          <Separator />
          <div>
            <div className="text-xs font-medium mb-1">Security</div>
            <div className="flex items-center justify-between">
              <div className="text-xs">Two-Factor Authentication</div>
              <Button variant="outline" size="sm" className="h-6 text-xs">Enable</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesTab; 