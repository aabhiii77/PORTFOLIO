import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <main className="min-h-screen bg-[var(--color-cream,#FBECDC)] text-[var(--color-espresso-deep,#1D0F0A)] flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full border border-[rgba(55,31,19,0.22)] bg-[var(--color-cream,#FBECDC)] p-8">
            <h1 className="font-display text-xl font-bold tracking-[-0.02em] uppercase">
              Unable to load view
            </h1>
            <p className="mt-3 text-sm leading-[1.6] text-[var(--color-espresso,#371F13)]">
              Please reload the page to restore the portfolio.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center bg-[var(--color-espresso-deep,#1D0F0A)] text-[var(--color-cream,#FBECDC)] px-5 py-2.5 min-h-[44px] text-xs font-display font-semibold tracking-[0.1em] uppercase cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
