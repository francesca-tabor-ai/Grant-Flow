import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

type AppItem = {
  id: string;
  status: string;
  submitted_at: string | null;
  deadline: string | null;
  grant_title: string;
  funder: string | null;
};

export default function Applications() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/applications')
      .then((r) => r.json())
      .then((data) => setApps(Array.isArray(data) ? data : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Applications</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Track submission status and deadlines. Start an application from the Grants page.
      </p>
      {apps.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No applications yet. Apply for a grant to see them here.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {apps.map((a) => (
            <li
              key={a.id}
              style={{
                padding: '1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <Link to={`/applications/${a.id}`} style={{ flex: 1, color: 'inherit', textDecoration: 'none' }}>
              <div>
                <strong>{a.grant_title}</strong>
                {a.funder && <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}> · {a.funder}</span>}
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Deadline {formatDate(a.deadline)} · {a.status}
                </p>
              </div>
              </Link>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  background: a.status === 'submitted' ? '#dcfce7' : a.status === 'in_progress' ? '#fef3c7' : '#f3f4f6',
                }}
              >
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
