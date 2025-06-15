
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail, KeyRound, LogIn, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type FormEvent, useState } from 'react';

const MOCK_AUTH_KEY = 'isBabyVerseMockLoggedIn';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmailField] = useState('');
  const [password, setPasswordField] = useState('');


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
        toast({ title: "Mission Control Alert!", description: "Please enter both email and password to engage hyperdrive.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem(MOCK_AUTH_KEY, 'true');
      window.dispatchEvent(new Event('authChange')); // Notify header to update
      toast({
        title: 'Login Successful!',
        description: "Welcome back to BabyVerse, Captain! Prepare for your next adventure.",
      });
      router.push('/profile'); // Redirect to profile or dashboard
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-[calc(100vh-15rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/20">
      <div className="relative w-full max-w-md space-y-8">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <Card className="relative z-10 bg-card/80 backdrop-blur-md shadow-glow-md border-accent/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               <Image src="https://placehold.co/100x100.png" alt="Zizo BabyVerse Logo" width={80} height={80} className="rounded-full" data-ai-hint="futuristic logo" />
            </div>
            <CardTitle className="text-3xl font-headline text-primary">Access Your Universe</CardTitle>
            <CardDescription className="text-muted-foreground">
              Log in to continue your journey in Zizo's BabyVerse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="anakin@skywalker.com"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground font-semibold">
                  <KeyRound className="inline-block mr-2 h-4 w-4 text-accent" /> Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPasswordField(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Checkbox can be added here if needed */}
                </div>
                <div className="text-sm">
                  <Link href="#" className="font-medium text-accent hover:text-accent/80 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105 animate-pulse-glow" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Logging In...' : 'Secure Login'}
                </Button>
              </div>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3">
                <Button variant="outline" className="w-full hover:bg-accent/10 hover:border-accent group" disabled={isLoading}>
                  <Github className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" /> 
                  Sign in with GitHub (Mock)
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              New to BabyVerse?{' '}
              <Link href="/signup" className="font-medium text-accent hover:text-accent/80 transition-colors">
                Launch Your Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
