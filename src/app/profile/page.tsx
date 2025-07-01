'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, Edit3, ShoppingBag, Star, KeyRound, LogOut, Baby, Loader2, PlusCircle, Trash2, Package, MapPin, CreditCard, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession, signOut } from 'next-auth/react';
import type { BabyProfile, Order, ShippingAddress } from '@/lib/types'; // Using PrismaBaby via lib/types
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [babyProfiles, setBabyProfiles] = useState<BabyProfile[]>([]);
  const [isLoadingBabies, setIsLoadingBabies] = useState(true);
  const [isBabyModalOpen, setIsBabyModalOpen] = useState(false);
  const [currentBaby, setCurrentBaby] = useState<Partial<BabyProfile>>({ name: '', ageInMonths: 0, weightInKilograms: undefined, allergies: '', preferences: '' });
  const [isSavingBaby, setIsSavingBaby] = useState(false);

  // Initialize tab from URL parameters
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setActiveTab(tab);
  }, [searchParams]);

  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    defaultShippingAddress: {} as ShippingAddress,
  });

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
      // Set active tab from URL params
      const urlTab = searchParams.get('tab');
      if (urlTab) {
        setActiveTab(urlTab);
      }
      fetchBabyProfiles();
      fetchProfile();
      fetchOrders();
    } else if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, searchParams]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Could not load your profile.",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Could not load your orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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


  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your cosmic profile...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto shadow-glow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <User className="mr-3 h-8 w-8 text-accent" /> My Profile
          </CardTitle>
          <CardDescription>Manage your account and view your order history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="bg-card/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <CardDescription>
                              Placed on {order.createdAt && !isNaN(new Date(order.createdAt).getTime()) ? format(new Date(order.createdAt), 'PPP') : 'Unknown date'}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium capitalize">{order.status}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Items:</span>
                            <span className="font-medium">{order.items.length} items</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">KSH {(order.totalAmount * 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground">
                    When you make your first purchase, it will appear here.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/products')}
                  >
                    Start Shopping
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Default Shipping Address</CardTitle>
                        <CardDescription>Used for order deliveries</CardDescription>
                      </div>
                      <Button variant="outline">Edit</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {profile.defaultShippingAddress ? (
                      <div className="space-y-1">
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.defaultShippingAddress.street}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.defaultShippingAddress.city}, {profile.defaultShippingAddress.postalCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.defaultShippingAddress.country}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No default shipping address set
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
