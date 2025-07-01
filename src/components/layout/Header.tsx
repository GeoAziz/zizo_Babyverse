'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'; // Renamed signOut to nextAuthSignOut
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogIn, LogOut, Star, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { auth, firebaseSignOut } from '@/lib/firebaseClient'; // Import Firebase auth and firebaseSignOut

export default function Header() {
  const { data: session, status } = useSession();
  const loggedIn = status === 'authenticated';
  const isLoading = status === 'loading';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth); // Sign out from Firebase
    } catch (error) {
      console.error("Firebase sign out error:", error);
      toast({ title: "Firebase Logout Error", description: "Could not sign out from Firebase. Please try again.", variant: "destructive" });
      // Decide if you want to proceed with NextAuth logout or stop
    }
    await nextAuthSignOut({ redirect: false, callbackUrl: '/' }); // Sign out from NextAuth
    toast({ title: "Logged Out", description: "You've successfully logged out of BabyVerse." });
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    router.push('/'); 
  };

  const handleLogin = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    router.push('/login');
  }

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/ai-assistant", label: "AI Assistant" },
    { href: "/chatbot", label: "Chat with Zizi" },
    { href: "/#featured-collections", label: "Collections" },
    { href: "/#deals", label: "Deals" },
  ];

  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-headline font-bold text-primary hover:text-accent transition-colors">
          Zizo's BabyVerse
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="View Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
          ) : loggedIn ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile/wishlist" aria-label="Wishlist">
                  <Star className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile" aria-label="My Profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          )}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card p-6">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-headline text-primary">Menu</h2>
                   <SheetClose asChild>
                     <Button variant="ghost" size="icon"><X className="h-5 w-5"/></Button>
                   </SheetClose>
                </div>
                <nav className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-lg hover:text-accent transition-colors py-2 border-b border-border"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                   {loggedIn && (
                    <>
                      <SheetClose asChild>
                        <Link href="/profile" className="text-lg hover:text-accent transition-colors py-2 border-b border-border">My Profile</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/profile/wishlist" className="text-lg hover:text-accent transition-colors py-2 border-b border-border">Wishlist</Link>
                      </SheetClose>
                       <SheetClose asChild>
                        <Link href="/profile/orders" className="text-lg hover:text-accent transition-colors py-2 border-b border-border">Order History</Link>
                      </SheetClose>
                        <Button variant="ghost" onClick={handleLogout} className="text-lg hover:text-accent transition-colors py-2 border-b border-border w-full justify-start text-destructive">
                          Logout
                        </Button>
                    </>
                  )}
                  {!loggedIn && !isLoading && (
                     <SheetClose asChild>
                        <Button variant="ghost" onClick={handleLogin} className="text-lg hover:text-accent transition-colors py-2 border-b border-border w-full justify-start">Login / Signup</Button>
                      </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}