import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches React render errors and shows a fallback UI.
 * Adapted from Manus reference implementation.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--color-bg, #fff)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 560,
              width: '100%',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
              Something went wrong
            </h2>
            <pre
              style={{
                padding: '1rem',
                width: '100%',
                borderRadius: 'var(--radius)',
                background: 'var(--color-muted, #f4f4f5)',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                marginBottom: '1.5rem',
              }}
            >
              {this.state.error?.message ?? 'Unknown error'}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
