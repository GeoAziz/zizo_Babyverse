'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings2, Mail, Rocket, Bell, Globe2 } from 'lucide-react';

interface SettingsState {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  priceAlerts: boolean;
  orderUpdates: boolean;
  stockAlerts: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    priceAlerts: true,
    orderUpdates: true,
    stockAlerts: false
  });

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev: SettingsState) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-headline text-primary flex items-center">
          <Settings2 className="mr-3 h-8 w-8 text-accent" /> Admin Settings
        </h1>
        <p className="text-muted-foreground">Manage your control center preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe2 className="mr-2 h-5 w-5 text-accent" /> Website Settings
            </CardTitle>
            <CardDescription>Configure global website settings and behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dark-mode">Dark Mode Default</Label>
              <Switch id="dark-mode" checked={settings.darkMode} onCheckedChange={(p: boolean) => handleToggle('darkMode')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" placeholder="Zizo's BabyVerse" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-accent" /> Notifications
            </CardTitle>
            <CardDescription>Manage notifications and alerts preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="order-updates">Order Updates</Label>
              <Switch id="order-updates" checked={settings.orderUpdates} onCheckedChange={(p: boolean) => handleToggle('orderUpdates')} />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="stock-alerts">Low Stock Alerts</Label>
              <Switch id="stock-alerts" checked={settings.stockAlerts} onCheckedChange={p => handleToggle('stockAlerts')} />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="price-alerts">Price Change Alerts</Label>
              <Switch id="price-alerts" checked={settings.priceAlerts} onCheckedChange={p => handleToggle('priceAlerts')} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" /> Email Notifications
                </Label>
                <Switch id="email-notifications" checked={settings.emailNotifications} onCheckedChange={p => handleToggle('emailNotifications')} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifications" className="flex items-center">
                  <Rocket className="mr-2 h-4 w-4" /> Push Notifications
                </Label>
                <Switch id="push-notifications" checked={settings.pushNotifications} onCheckedChange={p => handleToggle('pushNotifications')} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
