'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, ShoppingCart, Eye, Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [showRemoveDropdown, setShowRemoveDropdown] = useState(false);
  const [cartAnim, setCartAnim] = useState(false);
  const [wishlistAnim, setWishlistAnim] = useState(false);

  // Use global cart context
  const { items: cartItems, addItem, removeItem, isLoading: isCartLoading } = useCart();
  // Determine if this product is in the cart
  const inCart = cartItems.some(item => item.product.id === product.id);

  useEffect(() => {
    setInWishlist(false);
    // Optionally, fetch actual cart/wishlist state from API or context here for real sync
    // Example: fetch('/api/cart') and fetch('/api/wishlist') to setInCart/setInWishlist
  }, [product.id]);

  // --- Cart Logic ---
  const handleToggleCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!session) {
      toast({ title: 'Please Login', description: 'You need to be logged in to add items to your cart.', variant: 'destructive' });
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    if (product.stock < 1) {
      toast({ title: 'Out of Stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    setIsAddingToCart(true);
    setCartAnim(true);
    try {
      if (inCart) {
        // Remove from cart
        const cartItem = cartItems.find(item => item.product.id === product.id);
        if (cartItem) {
          await removeItem(cartItem.product.id);
          toast({ title: `${product.name} removed from cart.`, variant: 'destructive' });
        }
      } else {
        // Add to cart
        await addItem(product.id, 1);
        toast({ title: `${product.name} added to cart!`, description: 'Your little star will love it!' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Could not update cart.', variant: 'destructive' });
    } finally {
      setIsAddingToCart(false);
      setTimeout(() => setCartAnim(false), 800);
    }
  };

  // --- Wishlist Logic ---
  const handleToggleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!session) {
      toast({ title: 'Please Login', description: 'You need to be logged in to add items to your wishlist.', variant: 'destructive' });
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    setIsWishlisting(true);
    if (!inWishlist) {
      setInWishlist(true);
      setWishlistAnim(true);
      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!response.ok) throw new Error('Failed to add to wishlist');
        toast({ title: 'Added to Wishlist!', description: `${product.name} is now in your wishlist.` });
        // Play sound effect (wishlist-add)
        // const audio = new Audio('/sounds/wishlist-add.wav');
        // audio.play();
        window.dispatchEvent(new CustomEvent('wishlistUpdate'));
      } catch (error: any) {
        setInWishlist(false);
        toast({ title: 'Error', description: error.message || 'Could not update wishlist.', variant: 'destructive' });
      } finally {
        setIsWishlisting(false);
        setTimeout(() => setWishlistAnim(false), 1000);
      }
    } else {
      setInWishlist(false);
      setWishlistAnim(false);
      try {
        const response = await fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove from wishlist');
        toast({ title: 'Removed from Wishlist!', description: `${product.name} was removed from your wishlist.`, variant: 'destructive' });
        // Play sound effect (wishlist-remove)
        // const audio = new Audio('/sounds/wishlist-remove.wav');
        // audio.play();
        window.dispatchEvent(new CustomEvent('wishlistUpdate'));
      } catch (error: any) {
        setInWishlist(true);
        toast({ title: 'Error', description: error.message || 'Could not update wishlist.', variant: 'destructive' });
      } finally {
        setIsWishlisting(false);
      }
    }
  };

  // --- Animations & Accessibility ---
  // Add Tailwind classes for pulse, glow, floating, etc.
  // Add ARIA labels for accessibility

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className={`group flex flex-col h-full overflow-hidden shadow-card-glow hover:shadow-glow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${cartAnim ? 'animate-float-to-cart' : ''}`}>
        <CardHeader className="p-0 relative">
          <Image
            src={product.imageUrl || 'https://placehold.co/400x400.png'}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            data-ai-hint={product.dataAiHint || product.category?.toLowerCase() || 'product'}
            priority={false}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
          />
          <button
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={inWishlist}
            onClick={handleToggleWishlist}
            disabled={isWishlisting}
            className={`absolute top-3 right-3 z-20 rounded-full p-2 transition-colors duration-300 border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-accent ${inWishlist ? 'bg-red-700/90 text-white hover:bg-red-800 animate-pulse' : 'bg-white/80 text-accent hover:bg-accent/20'} ${wishlistAnim ? 'animate-pulse' : ''}`}
          >
            <Heart
              className={`h-6 w-6 transition-colors duration-300 ${inWishlist ? 'fill-red-700 text-red-700' : 'fill-none text-accent'}`}
            />
          </button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-accent">${product.price.toFixed(2)}</span>
            <button
              aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
              aria-pressed={inCart}
              onClick={handleToggleCart}
              disabled={isAddingToCart || product.stock < 1}
              className={`rounded-full p-2 transition-colors duration-300 border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-accent z-10
                ${inCart ? 'bg-accent text-white hover:bg-accent/90 animate-pulse' : 'bg-white/80 text-primary hover:bg-primary/10'}
                ${cartAnim ? 'animate-pulse' : ''}`}
            >
              {isAddingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className={`h-5 w-5 ${inCart ? 'fill-current' : 'stroke-current'}`} fill={inCart ? 'currentColor' : 'none'} />
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Add the following to your tailwind.config.js for custom animations:
// keyframes: {
//   'float-to-cart': { '0%': { transform: 'none' }, '100%': { transform: 'translateY(-40px) scale(0.5)', opacity: '0' } },
//   'heart-float': { '0%': { transform: 'none' }, '100%': { transform: 'translateY(-30px) scale(1.2)', opacity: '0' } },
//   'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
// },
// animation: {
//   'float-to-cart': 'float-to-cart 0.8s cubic-bezier(0.4,0,0.2,1)',
//   'heart-float': 'heart-float 0.7s cubic-bezier(0.4,0,0.2,1)',
//   'fade-in': 'fade-in 0.3s ease-in',
// },
