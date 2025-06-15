
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, KeyRound, Rocket, Baby, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setNameField] = useState('');
  const [email, setEmailField] = useState('');
  const [password, setPasswordField] = useState('');
  const [error, setError] = useState<string | null>(null);
  // const [createBabyProfile, setCreateBabyProfile] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name || !email || !password) {
        toast({ title: "Pre-Flight Check Failed!", description: "Ensure all star-navigator fields (Name, Email, Password) are filled.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Registration failed. Please try again.");
        toast({ title: "Registration Failed", description: data.message || "Could not create account.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Automatically sign in after successful registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });

      setIsLoading(false);

      if (signInResult?.ok && !signInResult.error) {
        toast({
          title: 'Account Launched!',
          description: "Welcome aboard BabyVerse, new Commander! Your cosmic journey begins now.",
        });
         const callbackUrl = searchParams.get('callbackUrl') || '/profile';
         router.push(callbackUrl);
      } else {
        setError(signInResult?.error || "Registration successful, but auto-login failed. Please try logging in manually.");
        toast({ title: "Login after signup failed", description: signInResult?.error || "Please login manually.", variant: "destructive"});
        router.push('/login'); // Redirect to login page if auto-signin fails
      }

    } catch (err) {
      setIsLoading(false);
      console.error("Signup fetch error:", err);
      setError("An unexpected error occurred during registration.");
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-15rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/20">
       <div className="relative w-full max-w-md space-y-8">
        <div className="absolute -top-10 -right-20 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-3000"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-5000"></div>

        <Card className="relative z-10 bg-card/80 backdrop-blur-md shadow-glow-md border-accent/30">
          <CardHeader className="text-center">
             <div className="mx-auto mb-4">
               <Image src="https://placehold.co/100x100.png" alt="Zizo BabyVerse Registration Icon" width={80} height={80} className="rounded-full animate-pulse" data-ai-hint="rocket icon" />
            </div>
            <CardTitle className="text-3xl font-headline text-primary">Join the BabyVerse</CardTitle>
            <CardDescription className="text-muted-foreground">
              Create your account and start your cosmic parenting adventure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground font-semibold">
                  <UserPlus className="inline-block mr-2 h-4 w-4 text-accent" /> Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setNameField(e.target.value)}
                  placeholder="Leia Organa"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground font-semibold">
                  <Mail className="inline-block mr-2 h-4 w-4 text-accent" /> Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder="leia@rebellion.org"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground font-semibold">
                  <KeyRound className="inline-block mr-2 h-4 w-4 text-accent" /> Create Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPasswordField(e.target.value)}
                  placeholder="Choose a secure password (min 6 chars)"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <Switch id="create-baby-profile" disabled={isLoading} />
                <Label htmlFor="create-baby-profile" className="text-sm text-muted-foreground font-semibold flex items-center">
                  <Baby className="inline-block mr-2 h-4 w-4 text-accent" /> Create Baby Profile now? (Optional)
                </Label>
              </div>
              <div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105 animate-pulse-glow" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Launching Account...' : 'Launch My Account'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
                Log In to Your Universe
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
