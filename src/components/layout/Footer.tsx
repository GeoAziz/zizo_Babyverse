import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-3 text-primary">Zizo's BabyVerse</h3>
            <p className="text-sm text-muted-foreground">Your futuristic journey into parenting starts here. Discover AI-powered recommendations and cosmic-class baby products.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Connect With Us</h4>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-accent transition-colors"><Facebook size={24} /></Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-accent transition-colors"><Twitter size={24} /></Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-accent transition-colors"><Instagram size={24} /></Link>
              <Link href="#" aria-label="YouTube" className="text-muted-foreground hover:text-accent transition-colors"><Youtube size={24} /></Link>
            </div>
            <div className="mt-4">
              <h5 className="text-md font-semibold mb-1">Newsletter</h5>
              <p className="text-sm text-muted-foreground mb-2">Stay updated with our latest products and offers.</p>
              {/* Newsletter form placeholder */}
              <form className="flex">
                <input type="email" placeholder="Enter your email" className="px-3 py-2 border border-input rounded-l-md focus:ring-accent focus:border-accent flex-grow text-sm" />
                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md hover:bg-primary/90 text-sm">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          &copy; {currentYear} Zizo's BabyVerse. All rights reserved. Prepare for liftoff! 🚀
        </div>
      </div>
    </footer>
  );
}
