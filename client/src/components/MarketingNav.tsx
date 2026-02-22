import { Link } from 'react-router-dom';

export default function MarketingNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'saturate(180%) blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
            GrantFlow AI
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to="/case-studies"
            className="micro-link"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Case studies
          </Link>
          <Link
            to="/pricing"
            className="micro-link"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            Pricing
          </Link>
          <Link
            to="/login"
            className="micro-link micro-btn"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid var(--color-accent-start)',
              color: 'var(--color-accent-start)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="btn-primary-micro micro-link"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
