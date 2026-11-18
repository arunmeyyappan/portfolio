import { Component, type ReactNode } from 'react';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="eyebrow">Something went wrong</p>
          <h1 className="display mt-4 text-4xl">This page hit an unexpected error.</h1>
          <p className="mt-4" style={{ color: 'var(--muted)' }}>
            Please reload the page. If it keeps happening, check the browser console.
          </p>
          <button className="btn btn-primary mt-8" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </main>
    );
  }
}
