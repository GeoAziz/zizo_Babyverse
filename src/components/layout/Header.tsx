import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogIn, Star, Bot } from 'lucide-react';

export default function Header() {
  // Placeholder for authentication status
  const isLoggedIn = false; 

  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-headline font-bold text-primary hover:text-accent transition-colors">
          Zizo's BabyVerse
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/products" className="hover:text-accent transition-colors">Shop</Link>
          <Link href="/ai-assistant" className="hover:text-accent transition-colors">AI Assistant</Link>
          <Link href="/#featured-collections" className="hover:text-accent transition-colors">Collections</Link>
          <Link href="/#deals" className="hover:text-accent transition-colors">Deals</Link>
        </nav>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="View Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          {isLoggedIn ? (
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
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
           <Button variant="ghost" size="icon" className="md:hidden">
            {/* Placeholder for mobile menu */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
