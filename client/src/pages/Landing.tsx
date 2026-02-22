import { Link } from 'react-router-dom';
import MarketingNav from '../components/MarketingNav';

export default function Landing() {
  return (
    <div className="page-transition-enter" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <MarketingNav />

      {/* Hero – Customer & Pain Point */}
      <section style={{ paddingTop: 160, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 1rem',
                borderRadius: 9999,
                background: 'rgba(99, 102, 241, 0.08)',
                color: 'var(--color-accent-start)',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <span aria-hidden>🏛️</span>
              For CICs, social enterprises & mission-driven organisations
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            Grant applications shouldn’t <br />
            <span className="landing-gradient-text">sink your mission.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            You’re juggling deadlines, re-typing the same details across dozens of forms, and still missing opportunities. GrantFlow gives you one place to store your story—and turns it into matched grants, draft proposals, and a clear pipeline.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link
              to="/register"
              className="btn-primary-micro micro-link"
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
                textDecoration: 'none',
              }}
            >
              Get started free
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/pricing"
              className="micro-link micro-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.875rem 1.75rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                borderRadius: 9999,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                textDecoration: 'none',
              }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* How we solve it */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem', color: 'var(--color-text)' }}>
            One profile. Less duplication. Fewer missed grants.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              {
                title: 'Smart matching',
                description: 'Store your mission, sector, and impact once. GrantFlow surfaces grants that actually fit—with eligibility signals so you focus on opportunities that matter.',
              },
              {
                title: 'Proposal drafting',
                description: 'AI pulls from your profile and grant requirements to draft proposals that sound like you. Edit, version, and export to PDF or Word when ready.',
              },
              {
                title: 'Pipeline visibility',
                description: 'Track every application, deadline, and next step in one place. No more spreadsheets or last-minute scrambles.',
              },
            ].map((f, i) => (
              <div key={i} className="landing-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
            Built for CICs, social enterprises, and fundraising teams who want to spend less time on paperwork and more on impact.
          </p>
        </div>
      </section>

      {/* Social proof teaser */}
      <section style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trusted by mission-driven organisations
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', opacity: 0.8 }}>Social Impact CIC</span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', opacity: 0.8 }}>Community Foundation</span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', opacity: 0.8 }}>Green Futures Ltd</span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', opacity: 0.8 }}>Youth Action Network</span>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/case-studies" style={{ fontWeight: 600, color: 'var(--color-accent-start)' }}>
              Read case studies →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
