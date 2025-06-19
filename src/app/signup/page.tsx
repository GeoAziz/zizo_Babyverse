'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch'; // Removed as per simplified flow
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, KeyRound, Rocket, Loader2, AlertCircle } from 'lucide-react'; // Baby icon removed
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { auth } from '@/lib/firebaseClient'; // Firebase client auth
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Google icon SVG as a component (same as login page)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="mr-2">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.001-0.001l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

function SignupPageContent(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [nameField, setNameField] = useState('');
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const handleEmailPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!nameField || !emailField || !passwordField) {
        toast({ title: "Pre-Flight Check Failed!", description: "Name, Email, and Password are required.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
    if (passwordField.length < 6) {
        toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive"});
        setError("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailField, passwordField);
      const idToken = await userCredential.user.getIdToken();
      // Optionally update Firebase user's display name here if needed, though NextAuth sync can handle it.
      // await updateProfile(userCredential.user, { displayName: nameField });


      // Sign in with NextAuth to create session and sync user to Prisma
      const result = await signIn('credentials', {
        redirect: false,
        idToken: idToken,
        authType: 'FIREBASE_EMAIL',
        name: nameField, // Pass name for initial Prisma user creation
      });

      if (result?.ok && !result.error) {
        toast({ title: 'Account Launched!', description: "Welcome aboard BabyVerse, new Commander!" });
        router.push(callbackUrl);
      } else {
        setError(result?.error || "Signup successful with Firebase, but NextAuth login failed.");
        toast({ title: 'NextAuth Sync Failed', description: result?.error || "Please try logging in.", variant: 'destructive'});
      }
    } catch (firebaseError: any) {
      console.error("Firebase signup error:", firebaseError);
      let friendlyMessage = "Registration failed. Please try again.";
      if (firebaseError.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered. Try logging in or use a different email.";
      } else if (firebaseError.code === 'auth/weak-password') {
        friendlyMessage = "Password is too weak. Please choose a stronger one (at least 6 characters).";
      }
      setError(friendlyMessage);
      toast({ title: 'Registration Failed', description: friendlyMessage, variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);
    // Use NextAuth's Google provider for sign-up
    const result = await signIn('google', { redirect: false, callbackUrl });

    if (result?.error) {
      console.error("NextAuth Google Sign-Up Error:", result.error);
       if (result.error === "OAuthAccountNotLinked") {
        setError("This Google account's email is already in use with an email/password account. Please log in with your email and password.");
        toast({ title: "Account Conflict", description: "This Google account's email is already associated with an existing password account.", variant: "destructive"});
      } else {
        setError("Google Sign-Up failed. Please try again.");
        toast({ title: "Google Sign-Up Failed", description: result.error, variant: "destructive" });
      }
    } else if (result?.ok) {
      toast({ title: "Account Created with Google!", description: "Welcome to BabyVerse!" });
      // router.push(callbackUrl); // NextAuth handles redirect on success
    }
    setIsGoogleLoading(false); // Only set if not redirecting
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
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
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
                  value={nameField}
                  onChange={(e) => setNameField(e.target.value)}
                  placeholder="Leia Organa"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading || isGoogleLoading}
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
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder="leia@rebellion.org"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading || isGoogleLoading}
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
                  value={passwordField}
                  onChange={(e) => setPasswordField(e.target.value)}
                  placeholder="Choose a secure password (min 6 chars)"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              {/* Optional: Baby profile switch removed for simplicity now, can be added in profile page */}
              <div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Launching Account...' : 'Launch My Account'}
                </Button>
              </div>
            </form>
             <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3">
                 <Button variant="outline" className="w-full hover:bg-accent/10 hover:border-accent group" disabled={isLoading || isGoogleLoading} onClick={handleGoogleSignUp}>
                   {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <GoogleIcon />}
                   Sign up with Google
                </Button>
              </div>
            </div>
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}