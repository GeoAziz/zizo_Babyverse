
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, Edit3, ShoppingBag, Star, KeyRound, LogOut, Baby, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession, signOut } from 'next-auth/react';
import type { BabyProfile } from '@/lib/types'; // Using PrismaBaby via lib/types

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [babyProfiles, setBabyProfiles] = useState<BabyProfile[]>([]);
  const [isLoadingBabies, setIsLoadingBabies] = useState(true);
  const [isBabyModalOpen, setIsBabyModalOpen] = useState(false);
  const [currentBaby, setCurrentBaby] = useState<Partial<BabyProfile>>({ name: '', ageInMonths: 0, weightInKilograms: undefined, allergies: '', preferences: '' });
  const [isSavingBaby, setIsSavingBaby] = useState(false);


  const fetchBabyProfiles = async () => {
    if (status !== 'authenticated') return;
    setIsLoadingBabies(true);
    try {
      const response = await fetch('/api/babies');
      if (!response.ok) throw new Error('Failed to fetch baby profiles');
      const data: BabyProfile[] = await response.json();
      setBabyProfiles(data);
    } catch (error) {
      toast({ title: "Error", description: "Could not load baby profiles.", variant: "destructive" });
    } finally {
      setIsLoadingBabies(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      fetchBabyProfiles();
    } else if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    // Mock update: In a real app, call API to update user, then potentially update session
    // For example: await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify({ name }) });
    // await updateSession({ ...session, user: { ...session?.user, name }}); // If API returns updated user
    toast({ title: "Profile Updated (Mock)", description: "Name change reflected locally. Email is fixed." });
    if (session?.user) session.user.name = name; // Locally update session mock
  };

  const handleLogout = async () => {
    await signOut({ redirect: false, callbackUrl: '/' });
    toast({ title: "Logged Out", description: "You've successfully logged out. Come back soon, space explorer!" });
    router.push('/');
  };

  const handleBabyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentBaby(prev => ({ ...prev, [name]: name === 'ageInMonths' || name === 'weightInKilograms' ? parseFloat(value) || 0 : value }));
  };

  const handleSaveBabyProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentBaby.name || currentBaby.ageInMonths == null || currentBaby.ageInMonths < 0) {
      toast({ title: "Invalid Baby Info", description: "Please provide at least a name and a valid age.", variant: "destructive" });
      return;
    }
    setIsSavingBaby(true);
    try {
      // const method = currentBaby.id ? 'PUT' : 'POST';
      // const url = currentBaby.id ? `/api/babies/${currentBaby.id}` : '/api/babies';
      const response = await fetch('/api/babies', { // Simplified to POST only for now
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentBaby),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save baby profile`);
      }
      await fetchBabyProfiles(); // Refetch list
      toast({ title: "Baby Profile Saved!", description: `${currentBaby.name}'s info is up to date.` });
      setIsBabyModalOpen(false);
      setCurrentBaby({ name: '', ageInMonths: 0, weightInKilograms: undefined, allergies: '', preferences: '' }); // Reset form
    } catch (error: any) {
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingBaby(false);
    }
  };
  
  const handleDeleteBabyProfile = async (babyId: string) => {
    if (!confirm("Are you sure you want to remove this little star's profile?")) return;
    try {
        const response = await fetch(`/api/babies/${babyId}`, {method: 'DELETE'});
        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete baby profile");
        }
        toast({title: "Baby Profile Removed", variant: "destructive"});
        fetchBabyProfiles(); // Refresh list
    } catch (error: any) {
        toast({title: "Delete Error", description: error.message, variant: "destructive"});
    }
  };

  const openAddBabyModal = () => {
    setCurrentBaby({ name: '', ageInMonths: 0, weightInKilograms: undefined, allergies: '', preferences: '' });
    setIsBabyModalOpen(true);
  };


  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying your cosmic credentials...</p>
      </div>
    );
  }

  if (!session) { 
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
              <Button variant="ghost" size="icon" onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-accent hover:text-accent/80">
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled/>
                   <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
                </div>
                <Button onClick={handleSaveProfile} className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="ml-2">Cancel</Button>
              </div>
            ) : (
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary">My Little Stars</h2>
                <Button variant="outline" size="sm" onClick={openAddBabyModal} className="border-accent text-accent hover:bg-accent/10">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Baby
                </Button>
            </div>
            {isLoadingBabies ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2"/> Loading baby profiles...
                </div>
            ) : babyProfiles.length > 0 ? (
              <ul className="space-y-3">
                {babyProfiles.map(baby => (
                  <li key={baby.id} className="p-3 bg-muted/30 rounded-md flex justify-between items-center shadow-sm hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <Baby className="h-6 w-6 text-accent mr-3"/>
                      <div>
                        <p className="font-medium text-primary">{baby.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {baby.ageInMonths} months old
                            {baby.weightInKilograms && `, ${baby.weightInKilograms}kg`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 h-7 w-7">
                            <Edit3 className="h-4 w-4" />
                        </Button> */}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBabyProfile(baby.id)} className="text-destructive hover:text-destructive/80 h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">No baby profiles added yet. Add your little star to get personalized experiences!</p>
            )}
          </section>

          <Dialog open={isBabyModalOpen} onOpenChange={setIsBabyModalOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle className="font-headline text-xl text-primary">
                    {currentBaby.id ? 'Edit Little Star' : 'Add a New Little Star'}
                </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveBabyProfile} className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="babyName">Baby's Name</Label>
                        <Input id="babyName" name="name" value={currentBaby.name || ''} onChange={handleBabyInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="ageInMonths">Age (in months)</Label>
                        <Input id="ageInMonths" name="ageInMonths" type="number" value={currentBaby.ageInMonths || 0} onChange={handleBabyInputChange} required min="0"/>
                    </div>
                    <div>
                        <Label htmlFor="weightInKilograms">Weight (in kg, optional)</Label>
                        <Input id="weightInKilograms" name="weightInKilograms" type="number" step="0.1" value={currentBaby.weightInKilograms || ''} onChange={handleBabyInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="allergies">Allergies (optional, comma-separated)</Label>
                        <Textarea id="allergies" name="allergies" value={currentBaby.allergies || ''} onChange={handleBabyInputChange} rows={2}/>
                    </div>
                     <div>
                        <Label htmlFor="preferences">Preferences (optional, e.g., loves music, organic only)</Label>
                        <Textarea id="preferences" name="preferences" value={currentBaby.preferences || ''} onChange={handleBabyInputChange} rows={2}/>
                    </div>
                <DialogFooter className="mt-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSavingBaby}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSavingBaby} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isSavingBaby ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save Little Star
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">Navigation Deck</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" asChild className="justify-start p-4 h-auto text-left hover:border-primary hover:bg-primary/5 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm">
                <Link href="/profile/orders" className="flex items-center">
                  <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold">Order History</span>
                    <p className="text-xs text-muted-foreground">View your past purchases</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start p-4 h-auto text-left hover:border-primary hover:bg-primary/5 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm">
                <Link href="/profile/wishlist" className="flex items-center">
                  <Star className="mr-3 h-5 w-5 text-primary" />
                   <div>
                    <span className="font-semibold">My Wishlist</span>
                    <p className="text-xs text-muted-foreground">Your saved favorite items</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" disabled asChild className="justify-start p-4 h-auto text-left hover:border-primary hover:bg-primary/5 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm opacity-60 cursor-not-allowed">
                 <Link href="#" className="flex items-center"> 
                  <KeyRound className="mr-3 h-5 w-5 text-primary" />
                   <div>
                    <span className="font-semibold">Change Password</span>
                    <p className="text-xs text-muted-foreground">Update your security (soon)</p>
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
