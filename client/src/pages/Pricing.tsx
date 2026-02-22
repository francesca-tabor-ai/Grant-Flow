import { Link } from 'react-router-dom';
import MarketingNav from '../components/MarketingNav';

const tiers = [
  {
    name: 'Individual',
    tagline: 'For solo fundraisers and small organisations',
    price: 29,
    period: '/month',
    features: [
      '1 organisation profile',
      'Up to 5 active applications',
      'AI proposal drafting',
      'Grant matching & eligibility',
      'Basic budget templates',
      'PDF & Word export',
    ],
    cta: 'Start free trial',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Team',
    tagline: 'For growing fundraising teams',
    price: 99,
    period: '/month',
    features: [
      'Up to 5 organisation profiles',
      'Unlimited applications',
      'AI proposal drafting',
      'Advanced grant matching',
      'Full budget templates',
      'Team collaboration',
      'Shared workspace',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    tagline: 'For large organisations & portfolios',
    price: null,
    period: '',
    priceLabel: 'Custom',
    features: [
      'Unlimited organisations',
      'Unlimited applications',
      'Everything in Team',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantee',
      'Onboarding & training',
      'API access',
    ],
    cta: 'Contact sales',
    href: 'mailto:enterprise@grantflow.ai',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="page-transition-enter" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <MarketingNav />

      <section style={{ paddingTop: 160, paddingBottom: 120, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem', color: 'var(--color-text)' }}>
              Simple, scalable pricing
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
              Start free. Upgrade when you need more organisations and team features.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch',
            }}
          >
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="landing-card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: tier.highlighted ? '2px solid var(--color-accent-start)' : undefined,
                  boxShadow: tier.highlighted ? '0 8px 30px rgba(99, 102, 241, 0.15)' : undefined,
                }}
              >
                {tier.highlighted && (
                  <span
                    style={{
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 9999,
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--color-accent-start)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                    }}
                  >
                    Most popular
                  </span>
                )}
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-text)' }}>
                  {tier.name}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {tier.tagline}
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  {tier.price !== null ? (
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
                      £{tier.price}
                      <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{tier.period}</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
                      {tier.priceLabel}
                    </span>
                  )}
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1 }}>
                  {tier.features.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0',
                        fontSize: '0.9375rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <span style={{ color: 'var(--color-accent-start)', fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.href.startsWith('mailto:') ? (
                  <a
                    href={tier.href}
                    className={tier.highlighted ? 'btn-primary-micro micro-link' : 'micro-link micro-btn'}
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '1.5rem',
                    padding: '0.875rem 1.5rem',
                    borderRadius: 9999,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    ...(tier.highlighted
                      ? {
                          background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                          color: '#fff',
                          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                        }
                      : {
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }),
                  }}
                >
                  {tier.cta}
                </a>
                ) : (
                  <Link
                    to={tier.href}
                    className={tier.highlighted ? 'btn-primary-micro micro-link' : 'micro-link micro-btn'}
                    style={{
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: '1.5rem',
                      padding: '0.875rem 1.5rem',
                      borderRadius: 9999,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      ...(tier.highlighted
                        ? {
                            background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                            color: '#fff',
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                          }
                        : {
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                          }),
                    }}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
