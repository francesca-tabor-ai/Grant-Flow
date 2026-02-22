import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

type Grant = {
  id: string;
  title: string;
  description: string | null;
  funder: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
};

export default function Grants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('sort', sort);
    params.set('order', order);
    apiFetch(`/api/grants?${params}`)
      .then((r) => r.json())
      .then((data) => setGrants(Array.isArray(data) ? data : []))
      .catch(() => setGrants([]))
      .finally(() => setLoading(false));
  }, [q, sort, order]);

  const formatAmount = (min: number | null, max: number | null) => {
    if (min != null && max != null) return `£${min.toLocaleString()} – £${max.toLocaleString()}`;
    if (max != null) return `Up to £${max.toLocaleString()}`;
    if (min != null) return `From £${min.toLocaleString()}`;
    return '—';
  };

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Grants</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Discover and filter funding opportunities. Matching and eligibility coming next.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search grants…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            minWidth: 200,
          }}
        />
        <select
          value={`${sort}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-');
            setSort(s);
            setOrder(o as 'asc' | 'desc');
          }}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
          }}
        >
          <option value="created_at-desc">Newest first</option>
          <option value="created_at-asc">Oldest first</option>
          <option value="deadline-asc">Deadline soonest</option>
          <option value="deadline-desc">Deadline latest</option>
          <option value="title-asc">Title A–Z</option>
          <option value="amount_max-desc">Amount (high first)</option>
        </select>
      </div>
      {grants.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No grants found. Add seed data with <code>npm run db:seed</code>.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {grants.map((g) => (
            <li
              key={g.id}
              className="micro-card"
              style={{
                padding: '1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                marginBottom: '0.5rem',
              }}
            >
              <strong>{g.title}</strong>
              {g.funder && <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}> · {g.funder}</span>}
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {g.description?.slice(0, 160)}{g.description && g.description.length > 160 ? '…' : ''}
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                {formatAmount(g.amount_min, g.amount_max)} · Deadline {formatDate(g.deadline)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
