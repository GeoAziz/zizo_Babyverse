// TypeScript declaration for lucide-react icon ESM modules
// This fixes TS7016 for direct icon imports

declare module 'lucide-react/dist/esm/icons/*.js' {
  import * as React from 'react';
  const Icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & { color?: string; size?: string | number }>;
  export default Icon;
}
