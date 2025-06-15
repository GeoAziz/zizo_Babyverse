
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Edit3, ShoppingBag, Star, KeyRound, LogOut, Baby } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock user data
const mockUser = {
  id: 'user_123_galaxy',
  name: 'Lana Astranova',
  email: 'lana.astranova@babyverse.com',
  joinDate: 'Stardate 77432.3',
  babyProfiles: [
    { id: 'baby_01', name: 'Orion', ageInMonths: 8 },
    { id: 'baby_02', name: 'Nova', ageInMonths: 32 },
  ]
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const { toast } = useToast();

  const handleSave = () => {
    // Mock save action
    mockUser.name = name;
    mockUser.email = email;
    setIsEditing(false);
    toast({ title: "Profile Updated", description: "Your cosmic coordinates have been recalibrated!" });
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto shadow-glow-lg border-accent/30">
        <CardHeader className="text-center border-b pb-6">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <User size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">My BabyVerse Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your account details and preferences for your intergalactic parenting journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Account Information Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Account Information</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="text-accent hover:text-accent/80">
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="ml-2">Cancel</Button>
              </div>
            ) : (
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Joined BabyVerse:</strong> {mockUser.joinDate}</p>
              </div>
            )}
          </section>

          {/* Baby Profiles Section */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">My Little Stars (Baby Profiles)</h2>
            {mockUser.babyProfiles.length > 0 ? (
              <ul className="space-y-3">
                {mockUser.babyProfiles.map(baby => (
                  <li key={baby.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <Baby className="h-5 w-5 text-accent mr-3"/>
                      <span>{baby.name} - {baby.ageInMonths} months old</span>
                    </div>
                    <Button variant="link" size="sm" className="text-accent p-0 h-auto">Edit</Button> {/* Mock edit */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No baby profiles added yet.</p>
            )}
            <Button variant="outline" className="mt-4 border-accent text-accent hover:bg-accent/10">
              <Baby className="mr-2 h-4 w-4"/> Add Baby Profile (Coming Soon)
            </Button>
          </section>

          {/* Quick Links Section */}
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">Navigation Deck</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" asChild className="justify-start p-4 h-auto text-left hover:border-primary hover:bg-primary/5">
                <Link href="/profile/orders" className="flex items-center">
                  <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold">Order History</span>
                    <p className="text-xs text-muted-foreground">View your past purchases</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start p-4 h-auto text-left hover:border-primary hover:bg-primary/5">
                <Link href="/profile/wishlist" className="flex items-center">
                  <Star className="mr-3 h-5 w-5 text-primary" />
                   <div>
                    <span className="font-semibold">My Wishlist</span>
                    <p className="text-xs text-muted-foreground">Your saved favorite items</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start p-4 h-auto text-left hover:border-primary hover:bg-primary/5">
                 <Link href="#" className="flex items-center"> {/* Placeholder for change password */}
                  <KeyRound className="mr-3 h-5 w-5 text-primary" />
                   <div>
                    <span className="font-semibold">Change Password</span>
                    <p className="text-xs text-muted-foreground">Update your security</p>
                  </div>
                </Link>
              </Button>
            </div>
          </section>
        </CardContent>
        <CardFooter className="border-t p-6">
            <Button variant="destructive" className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4"/> Log Out of BabyVerse
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
