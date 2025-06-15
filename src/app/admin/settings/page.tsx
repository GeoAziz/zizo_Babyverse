'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Settings, Save, Bell, Palette, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // Placeholder state for settings
  const [settings, setSettings] = useState({
    storeName: "Zizo's BabyVerse",
    adminEmail: "admin@babyverse.com",
    notificationsEnabled: true,
    maintenanceMode: false,
    themeColor: "#2C3E50", // Example primary color
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveChanges = () => {
    console.log("Settings saved:", settings);
    toast({
      title: "Settings Saved",
      description: "Your administrative settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
        <Settings className="mr-3 h-8 w-8 text-primary" /> Admin Settings
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card-glow">
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="mr-2 h-5 w-5 text-primary"/> General Settings</CardTitle>
            <CardDescription>Configure basic store and admin parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" name="storeName" value={settings.storeName} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="adminEmail">Admin Contact Email</Label>
              <Input id="adminEmail" name="adminEmail" type="email" value={settings.adminEmail} onChange={handleInputChange} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="maintenanceMode" name="maintenanceMode" checked={settings.maintenanceMode} onCheckedChange={(checked) => setSettings(p => ({...p, maintenanceMode: checked}))} />
              <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
            </div>
             <p className="text-xs text-muted-foreground">
                When enabled, users will see a maintenance page. Admins can still access the site.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card-glow">
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Notifications</CardTitle>
            <CardDescription>Manage admin notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="notificationsEnabled" name="notificationsEnabled" checked={settings.notificationsEnabled} onCheckedChange={(checked) => setSettings(p => ({...p, notificationsEnabled: checked}))}/>
              <Label htmlFor="notificationsEnabled">Receive Email Notifications for New Orders</Label>
            </div>
             <p className="text-xs text-muted-foreground">
                Get notified at {settings.adminEmail} for each new order.
            </p>
            {/* More notification settings can be added here */}
          </CardContent>
        </Card>
        
        <Card className="shadow-card-glow md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/> Appearance (Placeholder)</CardTitle>
            <CardDescription>Customize basic appearance settings. (Theme colors are primarily managed in CSS)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="themeColor">Primary Theme Color (Informational)</Label>
              <div className="flex items-center gap-2">
                <Input id="themeColor" name="themeColor" type="color" value={settings.themeColor} onChange={handleInputChange} className="w-16 h-10 p-1" disabled/>
                <span className="text-sm text-muted-foreground">Current primary: {settings.themeColor}. Change in globals.css.</span>
              </div>
            </div>
            {/* Add more appearance settings here if needed, e.g., logo upload */}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
