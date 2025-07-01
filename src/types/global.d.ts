// Global type declarations for missing modules during build

declare module 'next/server' {
  export interface NextRequest {
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
    url: string;
    method: string;
    headers: Headers;
    json(): Promise<any>;
  }
  
  export interface NextResponse {
    redirect(url: string | URL): NextResponse;
    json(data: any, init?: ResponseInit): NextResponse;
    next(): NextResponse;
    rewrite(destination: string | URL): NextResponse;
  }
  
  export const NextResponse: {
    redirect(url: string | URL): NextResponse;
    json(data: any, init?: ResponseInit): NextResponse;
    next(): NextResponse;
    rewrite(destination: string | URL): NextResponse;
  };
}

declare module 'next-auth/next' {
  export function getServerSession(req: any, res: any, options: any): Promise<any>;
}

declare module 'next-auth/middleware' {
  export default function withAuth(middleware?: any, options?: any): any;
}

declare module 'next-auth/react' {
  export function useSession(): { data: any; status: string };
  export function signIn(provider?: string, options?: any): Promise<any>;
  export function signOut(options?: any): Promise<any>;
  export function getSession(): Promise<any>;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    prefetch(href: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
  };
  export function useSearchParams(): URLSearchParams;
  export function usePathname(): string;
}

declare module 'next/link' {
  import { ComponentType } from 'react';
  const Link: ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }>;
  export default Link;
}

declare module 'next/image' {
  import { ComponentType } from 'react';
  const Image: ComponentType<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    [key: string]: any;
  }>;
  export default Image;
}

declare module 'react' {
  export * from '@types/react';
  export namespace React {
    interface HTMLAttributes<T> {
      className?: string;
      onClick?: (event: MouseEvent<T>) => void;
      children?: ReactNode;
      [key: string]: any;
    }
    interface MouseEvent<T = Element> {
      preventDefault(): void;
      stopPropagation(): void;
      target: EventTarget & T;
    }
    type ReactNode = string | number | boolean | ReactElement | ReactFragment | ReactPortal | null | undefined;
    interface ReactElement {
      type: any;
      props: any;
      key: string | number | null;
    }
    type ReactFragment = {};
    type ReactPortal = {};
  }
}

declare module 'lucide-react' {
  export const CheckCircle: any;
  export const Clock: any;
  export const Package: any;
  export const Truck: any;
  export const XCircle: any;
  export const Eye: any;
  export const Edit: any;
  export const Trash2: any;
  export const Plus: any;
  export const Search: any;
  export const Filter: any;
  export const Download: any;
  export const Upload: any;
  export const User: any;
  export const Mail: any;
  export const Calendar: any;
  export const DollarSign: any;
  export const ShoppingCart: any;
  export const TrendingUp: any;
  export const TrendingDown: any;
  export const AlertTriangle: any;
  export const Star: any;
  export const Heart: any;
  export const Share2: any;
  export const Minus: any;
  export const MapPin: any;
  export const Phone: any;
  export const Globe: any;
  export const CreditCard: any;
  export const Lock: any;
  export const Unlock: any;
  export const Home: any;
  export const Menu: any;
  export const X: any;
  export const ChevronDown: any;
  export const ChevronUp: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const ArrowLeft: any;
  export const ArrowRight: any;
  export const Settings: any;
  export const LogOut: any;
  export const LogIn: any;
  export const UserPlus: any;
}

declare module 'recharts' {
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  export const ResponsiveContainer: any;
  export const BarChart: any;
  export const Bar: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
}

declare module 'date-fns' {
  export function format(date: Date, formatStr: string): string;
  export function parseISO(dateString: string): Date;
  export function isValid(date: Date): boolean;
}

declare module 'zod' {
  export const z: any;
}

declare module 'stripe' {
  export default class Stripe {
    constructor(secretKey: string, config?: any);
    checkout: {
      sessions: {
        create(params: any): Promise<any>;
        retrieve(sessionId: string): Promise<any>;
      };
    };
    paymentIntents: {
      create(params: any): Promise<any>;
      retrieve(paymentIntentId: string): Promise<any>;
    };
  }
}

declare module 'nodemailer' {
  export function createTransporter(config: any): any;
  export function createTransport(config: any): any;
}

declare module 'firebase-admin' {
  const admin: any;
  export default admin;
}

declare module 'firebase-admin/firestore' {
  export const getFirestore: any;
  export const Timestamp: any;
  export const FieldValue: any;
}

// Process polyfill for build environments
declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code?: number): never;
};

// Require polyfill for dynamic imports
declare function require(module: string): any;

// Module polyfill
declare const module: {
  exports: any;
};

// Console polyfill
declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};

// Badge component types
declare module '@/components/ui/badge' {
  interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
  export const Badge: React.ComponentType<BadgeProps>;
}

// Global Firebase types
declare global {
  namespace FirebaseFirestore {
    interface Timestamp {
      toDate(): Date;
    }
    interface DocumentSnapshot {
      exists: boolean;
      data(): any;
      id: string;
    }
    interface Query {
      where(field: string, op: string, value: any): Query;
      orderBy(field: string, direction?: string): Query;
      limit(limit: number): Query;
      get(): Promise<QuerySnapshot>;
    }
    interface QuerySnapshot {
      docs: DocumentSnapshot[];
      forEach(callback: (doc: DocumentSnapshot) => void): void;
    }
  }
}