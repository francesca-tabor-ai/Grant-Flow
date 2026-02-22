import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
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
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
              GrantFlow AI
            </span>
          </div>
          <Link
            to="/login"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid var(--color-accent-start)',
              color: 'var(--color-accent-start)',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 1rem',
              borderRadius: 9999,
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-accent-start)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '2rem',
            }}
          >
            AI-powered grant writing for CICs
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            Secure funding for your <br />
            <span className="landing-gradient-text">mission faster.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Find grants that match your organisation, draft proposals with AI, and track applications in one place.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.75rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                borderRadius: 9999,
                background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              Get started free
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.875rem 1.75rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                borderRadius: 9999,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'Smart matching', description: 'Find grants that align with your mission and eligibility.' },
              { title: 'Proposal drafting', description: 'Generate and edit application content in one place.' },
              { title: 'Impact tracking', description: 'Keep organisations and applications organised.' },
            ].map((f, i) => (
              <div key={i} className="landing-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
