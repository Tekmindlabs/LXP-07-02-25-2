'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    necessary: true,
  });

  useEffect(() => {
    const hasConsent = localStorage.getItem('gdpr-consent');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleSave = async () => {
    try {
      localStorage.setItem('gdpr-consent', JSON.stringify(preferences));
      setShowBanner(false);
      toast({
        title: 'Preferences Saved',
        description: 'Your cookie preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences.',
        variant: 'destructive',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm">
      <Card>
        <CardHeader>
          <CardTitle>Cookie Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Necessary Cookies</p>
              <p className="text-sm text-muted-foreground">
                Required for the website to function properly
              </p>
            </div>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Analytics Cookies</p>
              <p className="text-sm text-muted-foreground">
                Help us improve our website
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, analytics: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Cookies</p>
              <p className="text-sm text-muted-foreground">
                Used for targeted advertising
              </p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, marketing: checked }))
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => handleSave()}>
            Accept Selected
          </Button>
          <Button
            onClick={() => {
              setPreferences({
                necessary: true,
                analytics: true,
                marketing: true,
              });
              handleSave();
            }}
          >
            Accept All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}