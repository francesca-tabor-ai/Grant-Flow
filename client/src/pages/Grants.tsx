import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

function FavoriteButton({ isFavorited, onToggle }: { isFavorited: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      style={{
        background: 'none',
        border: 'none',
        padding: '0.25rem',
        cursor: 'pointer',
        color: isFavorited ? '#ec4899' : 'var(--color-text-secondary)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

export default function Grants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [favorites, setFavorites] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const location = useLocation();
  const [showFavorites, setShowFavorites] = useState((location.state as { showFavorites?: boolean })?.showFavorites ?? false);

  const favoriteIds = new Set(favorites.map((g) => g.id));

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

  useEffect(() => {
    apiFetch('/api/grants/favorites')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]));
  }, []);

  const formatAmount = (min: number | null, max: number | null) => {
    if (min != null && max != null) return `£${min.toLocaleString()} – £${max.toLocaleString()}`;
    if (max != null) return `Up to £${max.toLocaleString()}`;
    if (min != null) return `From £${min.toLocaleString()}`;
    return '—';
  };

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

  const toggleFavorite = async (grant: Grant, isFavorited: boolean) => {
    const method = isFavorited ? 'DELETE' : 'POST';
    const res = await apiFetch(`/api/grants/${grant.id}/favorite`, { method });
    if (res.ok) {
      if (isFavorited) {
        setFavorites((prev) => prev.filter((g) => g.id !== grant.id));
      } else {
        setFavorites((prev) => [{ ...grant }, ...prev]);
      }
    }
  };

  const filteredList = showFavorites ? favorites.filter((g) => {
    if (!q) return true;
    const lower = q.toLowerCase();
    return (
      String(g.title).toLowerCase().includes(lower) ||
      String(g.description ?? '').toLowerCase().includes(lower) ||
      String(g.funder ?? '').toLowerCase().includes(lower)
    );
  }) : grants;

  if (loading && !showFavorites) return <p>Loading…</p>;

  return (
    <>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Grants</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        Discover and filter funding opportunities. Save grants to review later.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={() => setShowFavorites(false)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: !showFavorites ? 'var(--color-border)' : 'transparent',
              fontWeight: showFavorites ? 400 : 600,
            }}
          >
            All grants
          </button>
          <button
            type="button"
            onClick={() => setShowFavorites(true)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: showFavorites ? 'var(--color-border)' : 'transparent',
              fontWeight: showFavorites ? 600 : 400,
            }}
          >
            Saved ({favorites.length})
          </button>
        </div>
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
      {filteredList.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {showFavorites ? "No saved grants. Save grants you're interested in to revisit later." : (
            <>No grants found. Add seed data with <code>npm run db:seed</code>.</>
          )}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredList.map((g) => (
            <li
              key={g.id}
              className="micro-card"
              style={{
                padding: '1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{g.title}</strong>
                {g.funder && <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}> · {g.funder}</span>}
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {g.description?.slice(0, 160)}{g.description && g.description.length > 160 ? '…' : ''}
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                  {formatAmount(g.amount_min, g.amount_max)} · Deadline {formatDate(g.deadline)}
                </p>
              </div>
              <FavoriteButton
                isFavorited={favoriteIds.has(g.id)}
                onToggle={() => toggleFavorite(g, favoriteIds.has(g.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
