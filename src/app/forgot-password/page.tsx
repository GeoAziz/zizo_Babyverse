
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type FormEvent, useState } from 'react';
import { auth } from '@/lib/firebaseClient'; // Firebase client auth
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailField, setEmailField] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!emailField) {
        toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
      await sendPasswordResetEmail(auth, emailField);
      setSuccessMessage(`Password reset email sent to ${emailField}. Please check your inbox (and spam folder).`);
      toast({ title: 'Password Reset Email Sent', description: `Check ${emailField} for instructions.`});
      setEmailField(''); // Clear field after success
    } catch (firebaseError: any) {
      console.error("Firebase forgot password error:", firebaseError);
      let friendlyMessage = "Failed to send password reset email. Please try again.";
      if (firebaseError.code === 'auth/user-not-found') {
        friendlyMessage = "No user found with this email address.";
      } else if (firebaseError.code === 'auth/invalid-email') {
        friendlyMessage = "The email address is not valid.";
      }
      setError(friendlyMessage);
      toast({ title: 'Error', description: friendlyMessage, variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-15rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/20">
      <div className="relative w-full max-w-md space-y-8">
        <Card className="relative z-10 bg-card/80 backdrop-blur-md shadow-glow-md border-accent/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               <Image src="https://placehold.co/100x100.png" alt="Zizo BabyVerse Logo" width={80} height={80} className="rounded-full" data-ai-hint="key lock" />
            </div>
            <CardTitle className="text-3xl font-headline text-primary">Forgot Your Password?</CardTitle>
            <CardDescription className="text-muted-foreground">
              No worries, Commander! Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-500/10 text-green-700 text-sm rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {successMessage}
              </div>
            )}
            {!successMessage && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground font-semibold">
                    <Mail className="inline-block mr-2 h-4 w-4 text-accent" /> Registered Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={emailField}
                    onChange={(e) => setEmailField(e.target.value)}
                    placeholder="your-email@galaxy.com"
                    className="bg-input/50 border-border focus:border-accent focus:ring-accent"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
