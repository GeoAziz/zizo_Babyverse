import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90"
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}