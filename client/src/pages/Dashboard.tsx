import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Overview of your organisations, grants, and applications.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link
          to="/organizations"
          className="micro-card micro-link"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            color: 'inherit',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <strong>Organisations</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Manage CIC profile and knowledge base
          </p>
        </Link>
        <Link
          to="/grants"
          className="micro-card micro-link"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            color: 'inherit',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <strong>Grants</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Discover and filter funding opportunities
          </p>
        </Link>
        <Link
          to="/applications"
          className="micro-card micro-link"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            color: 'inherit',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <strong>Applications</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Track status and deadlines
          </p>
        </Link>
      </div>
    </>
  );
}
