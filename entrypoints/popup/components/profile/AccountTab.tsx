import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';

const AccountTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Account Details</CardTitle>
        <CardDescription className="text-xs">Manage your account settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div>
          <div className="text-xs font-medium mb-1">Storage Usage</div>
          <Progress value={65} className="h-1" />
          <div className="text-xs text-muted-foreground mt-1">65% of 1GB used</div>
        </div>
        <Separator />
        <div>
          <div className="text-xs font-medium mb-1">Subscription</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">Free Plan</div>
              <div className="text-xs text-muted-foreground">Basic features</div>
            </div>
            <Button variant="outline" size="sm" className="h-6 text-xs">Upgrade</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTab; 