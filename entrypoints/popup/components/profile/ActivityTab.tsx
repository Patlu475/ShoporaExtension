import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

const ActivityTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Recent Activity</CardTitle>
        <CardDescription className="text-xs">Your recent actions and updates.</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <div>
              <div className="text-xs font-medium">Product Scanned</div>
              <div className="text-xs text-muted-foreground">2 minutes ago</div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <div>
              <div className="text-xs font-medium">Wishlist Updated</div>
              <div className="text-xs text-muted-foreground">1 hour ago</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTab; 