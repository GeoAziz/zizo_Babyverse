
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Edit3, ShoppingBag, Star, KeyRound, LogOut, Baby, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession, signOut } from 'next-auth/react';
import type { User as PrismaUser } from '@prisma/client'; // Assuming Role is part of PrismaUser

interface BabyProfile { // Simplified for mock
  id: string;
  name: string;
  ageInMonths: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Mock baby profiles for now, would come from API
  const [babyProfiles, setBabyProfiles] = useState<BabyProfile[]>([
    { id: 'baby_01', name: 'Orion', ageInMonths: 8 },
    { id: 'baby_02', name: 'Nova', ageInMonths: 32 },
  ]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      // In a real app, fetch baby profiles here associated with session.user.id
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  const handleSave = async () => {
    setIsEditing(false);
    // In a real app, POST/PUT to an API endpoint to update user details
    // For example: await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify({ name, email }) });
    // Then, potentially update the session if NextAuth allows it, or refetch.
    toast({ title: "Profile Updated (Mock)", description: "Your cosmic coordinates have been recalibrated!" });
  };

  const handleLogout = async () => {
    await signOut({ redirect: false, callbackUrl: '/' });
    toast({ title: "Logged Out", description: "You've successfully logged out. Come back soon, space explorer!" });
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying your cosmic credentials...</p>
      </div>
    );
  }

  if (!session) { // Should be caught by middleware, but as a fallback
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }


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
            User Role: {(session.user as any)?.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
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
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled/>
                </div>
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="ml-2">Cancel</Button>
              </div>
            ) : (
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                {/* <p><strong>Joined BabyVerse:</strong> {session.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'N/A'}</p> */}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">My Little Stars (Baby Profiles)</h2>
            {babyProfiles.length > 0 ? (
              <ul className="space-y-3">
                {babyProfiles.map(baby => (
                  <li key={baby.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <Baby className="h-5 w-5 text-accent mr-3"/>
                      <span>{baby.name} - {baby.ageInMonths} months old</span>
                    </div>
                    <Button variant="link" size="sm" className="text-accent p-0 h-auto">Edit (Mock)</Button>
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
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4"/> Log Out of BabyVerse
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
