'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail, KeyRound, LogIn, Loader2, AlertCircle } from 'lucide-react'; // Github icon can be replaced by Google
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type FormEvent, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { auth } from '@/lib/firebaseClient'; // Firebase client auth
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Google icon SVG as a component
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="mr-2">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.001-0.001l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError) {
      if (authError === 'CredentialsSignin') {
        setError("Invalid email or password. Please try again.");
      } else if (authError === 'OAuthAccountNotLinked') {
        setError("This email is linked to another sign-in method. Try Google or reset password if you used email/password before.");
         toast({ title: "Sign-in Method Conflict", description: "This email might be associated with a different sign-in method (e.g., Google).", variant: "destructive"});
      } else if (authError === 'AuthError' || authError === 'true') { 
         setError("Authentication failed. Please check your credentials.");
      } else if (authError === 'Unauthorized') {
        setError("You are not authorized to access that page. Please log in.");
      } else {
        setError("An unknown authentication error occurred: " + authError);
      }
      router.replace('/login', undefined); 
    }
  }, [searchParams, router, toast]);

  const handleEmailPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Input validation
    if (!emailField.trim() || !passwordField) {
      toast({ 
        title: "Mission Control Alert!", 
        description: "Please enter both email and password.", 
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      // Try Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, emailField.trim(), passwordField);
      const idToken = await userCredential.user.getIdToken();
      
      // Try NextAuth sign in with Firebase token
      const result = await signIn('credentials', {
        redirect: false,
        idToken: idToken,
        authType: 'FIREBASE_EMAIL',
      });

      if (result?.ok && !result.error) {
        toast({ 
          title: 'Login Successful!', 
          description: "Welcome back to BabyVerse, Captain!"
        });
        // Check if user is admin and redirect accordingly
        const isAdmin = emailField.trim() === 'admin@babyverse.com';
        router.push(isAdmin ? '/admin/dashboard' : callbackUrl);
      } else {
        const errorMessage = result?.error === "CredentialsSignin" 
          ? "Invalid credentials." 
          : result?.error || "Login failed. Please try again.";
        setError(errorMessage);
        toast({ 
          title: 'Login Failed', 
          description: errorMessage, 
          variant: 'destructive'
        });
      }
    } catch (firebaseError: any) {
      console.error("Firebase login error:", firebaseError);
      let friendlyMessage = "Login failed. Please check your credentials.";
      
      switch (firebaseError.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyMessage = "Invalid email or password. Please try again.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-disabled':
          friendlyMessage = "This account has been disabled. Please contact support.";
          break;
        case 'auth/too-many-requests':
          friendlyMessage = "Too many failed login attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          friendlyMessage = "Network error. Please check your internet connection.";
          break;
        default:
          friendlyMessage = `Login failed: ${firebaseError.code || 'Unknown error'}`;
      }
      
      setError(friendlyMessage);
      toast({ 
        title: 'Login Failed', 
        description: friendlyMessage, 
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const result = await signIn('google', { redirect: false, callbackUrl });
    
    if (result?.error) {
      console.error("NextAuth Google Sign-In Error:", result.error);
      if (result.error === "OAuthAccountNotLinked") {
        setError("This email is already linked to an account using a different sign-in method. Please try logging in with email/password or contact support.");
        toast({ title: "Account Conflict", description: "This Google account's email may already be in use with a password.", variant: "destructive"});
      } else {
        setError("Google Sign-In failed. Please try again.");
        toast({ title: "Google Sign-In Failed", description: result.error, variant: "destructive" });
      }
      setIsGoogleLoading(false);
    } else if (result?.ok) {
      toast({ title: "Google Sign-In Successful!", description: "Welcome to BabyVerse!" });
      // router.push(callbackUrl); // NextAuth handles redirect on success if callbackUrl is set in signIn
    }
    // setIsGoogleLoading(false); // NextAuth signIn with redirect means this might not be reached if successful
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
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
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
                  placeholder="anakin@skywalker.com"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading || isGoogleLoading}
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
                  value={passwordField}
                  onChange={(e) => setPasswordField(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-accent hover:text-accent/80 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-glow-sm transition-all duration-300 transform hover:scale-105" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Verifying...' : 'Secure Login'}
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
                <Button variant="outline" className="w-full hover:bg-accent/10 hover:border-accent group" disabled={isLoading || isGoogleLoading} onClick={handleGoogleSignIn}>
                  {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <GoogleIcon />}
                  Sign in with Google
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
