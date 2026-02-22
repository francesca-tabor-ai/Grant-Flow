import { Link } from 'react-router-dom';
import MarketingNav from '../components/MarketingNav';

const logos = [
  'Social Impact CIC',
  'Community Foundation',
  'Green Futures Ltd',
  'Youth Action Network',
  'Health & Wellbeing Trust',
  'Education First CIC',
  'Sustainable Ventures',
  'Arts for All',
  'Neighbourhood Renewal Co',
  'Digital Inclusion Hub',
];

const caseStudies = [
  {
    company: 'Social Impact CIC',
    quote: 'We went from managing 3 applications in spreadsheets to 12 in GrantFlow. The AI drafts cut our proposal time by 60%.',
    author: 'Sarah Chen',
    role: 'Fundraising Lead',
    metric: '60%',
    metricLabel: 'faster proposal drafting',
  },
  {
    company: 'Green Futures Ltd',
    quote: 'The grant matching alone is worth it. We used to miss deadlines because we didn\'t know what was out there. Now we see everything that fits.',
    author: 'James Okonkwo',
    role: 'Operations Director',
    metric: '3x',
    metricLabel: 'more grants applied to',
  },
  {
    company: 'Youth Action Network',
    quote: 'Our team of four shares one workspace. No more duplicate data entry—one profile, all our applications. Game changer.',
    author: 'Emma Patel',
    role: 'CEO',
    metric: '75%',
    metricLabel: 'less admin time',
  },
];

export default function CaseStudies() {
  return (
    <div className="page-transition-enter" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <MarketingNav />

      {/* Scrolling logos */}
      <section
        style={{
          paddingTop: 120,
          paddingBottom: 3,
          overflow: 'hidden',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(0,0,0,0.02)',
        }}
      >
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: '2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Trusted by mission-driven organisations
        </p>
        <div className="logo-scroll-wrapper" style={{ position: 'relative' }}>
          <div className="logo-scroll" aria-hidden>
            {[...logos, ...logos].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="logo-scroll-item"
                style={{
                  flexShrink: 0,
                  padding: '0.75rem 2rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  background: 'var(--color-bg)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies content */}
      <section style={{ padding: '4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem', color: 'var(--color-text)' }}>
            Real impact for mission-driven teams
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
            See how CICs and social enterprises use GrantFlow to secure more funding with less admin.
          </p>
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {caseStudies.map((cs) => (
            <article
              key={cs.company}
              className="landing-card case-study-card"
              style={{
                padding: '2.5rem',
                marginBottom: '2rem',
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: '1fr',
                gridTemplateRows: 'auto auto',
                alignItems: 'center',
                textAlign: 'left',
              }}
            >
              <div>
                <blockquote
                  style={{
                    fontSize: '1.25rem',
                    lineHeight: 1.6,
                    color: 'var(--color-text)',
                    margin: '0 0 1rem',
                    fontStyle: 'italic',
                  }}
                >
                  "{cs.quote}"
                </blockquote>
                <div>
                  <cite style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--color-text)' }}>{cs.author}</cite>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>, {cs.role}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{cs.company}</div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'rgba(99, 102, 241, 0.06)',
                  borderRadius: 16,
                  minWidth: 140,
                }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {cs.metric}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  {cs.metricLabel}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
            Start your free trial
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
