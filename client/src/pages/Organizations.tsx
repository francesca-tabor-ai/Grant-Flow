import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

type Org = { id: string; name: string; mission: string | null; sector: string | null; location: string | null };

export default function Organizations() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');
  const [sector, setSector] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/organizations')
      .then((r) => r.json())
      .then((data) => setOrgs(Array.isArray(data) ? data : []))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mission: mission || null, sector: sector || null, location: location || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create');
      const newOrg = await res.json();
      setOrgs((prev) => [...prev, newOrg]);
      setShowForm(false);
      setName('');
      setMission('');
      setSector('');
      setLocation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Organisations</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            CIC profile and knowledge base for proposals and applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="micro-btn"
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            fontWeight: 600,
          }}
        >
          Add organisation
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          {error && <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>}
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
            }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mission</label>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
            }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sector</label>
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
            }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="micro-btn" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: 'none', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="micro-btn" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {orgs.length === 0 && !showForm ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No organisations yet. Add one to get started.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {orgs.map((org) => (
<li
            key={org.id}
            className="micro-card"
            style={{
                padding: '1rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                marginBottom: '0.5rem',
              }}
            >
              <strong>{org.name}</strong>
              {org.sector && <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}> · {org.sector}</span>}
              {org.mission && <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{org.mission}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
