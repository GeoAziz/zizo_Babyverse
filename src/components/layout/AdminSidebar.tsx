'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, ListOrdered, Users, PieChart, Tag, Settings, LogOut, Rocket } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { auth, firebaseSignOut } from '@/lib/firebaseClient';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Orders', icon: ListOrdered },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: PieChart }, // Changed from Customer Insights to Analytics
  { href: '/admin/promos', label: 'Promotions', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      await signOut({ redirect: false });
      toast({ title: "Logged Out", description: "Admin session ended successfully." });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col space-y-4 border-r border-sidebar-border">
      <Link href="/admin/dashboard" className="flex items-center space-x-2 p-2 mb-4">
        <Rocket className="h-8 w-8 text-sidebar-primary" />
        <span className="text-xl font-headline font-bold text-sidebar-foreground">Zizo Admin</span>
      </Link>
      <nav className="flex-grow">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard')
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left',
            'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
