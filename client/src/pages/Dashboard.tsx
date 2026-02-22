import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

type DeadlineAlert = {
  application_id: string;
  grant_title: string;
  deadline: string | null;
  status: string;
  days_until: number | null;
  alert: 'overdue' | 'due_soon' | 'ok';
};

type SavedGrant = {
  id: string;
  title: string;
  funder: string | null;
  amount_max: number | null;
  deadline: string | null;
};

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<DeadlineAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [savedGrants, setSavedGrants] = useState<SavedGrant[]>([]);

  useEffect(() => {
    apiFetch('/api/deadlines')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => setAlerts([]))
      .finally(() => setAlertsLoading(false));
  }, []);

  useEffect(() => {
    apiFetch('/api/grants/favorites')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSavedGrants(Array.isArray(data) ? data : []))
      .catch(() => setSavedGrants([]));
  }, []);

  const urgent = alerts.filter((a) => a.alert === 'overdue' || a.alert === 'due_soon');
  const overdueCount = alerts.filter((a) => a.alert === 'overdue').length;

  return (
    <>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Overview of your organisations, grants, and applications.
      </p>

      {alertsLoading ? (
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Loading deadlines…</p>
      ) : urgent.length > 0 ? (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            Deadline alerts
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {urgent.map((a) => (
              <li
                key={a.application_id}
                className="micro-card"
                style={{
                  padding: '1rem 1.25rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '0.5rem',
                  borderLeft: `4px solid ${a.alert === 'overdue' ? '#dc2626' : '#d97706'}`,
                  background: a.alert === 'overdue' ? '#fef2f2' : '#fffbeb',
                }}
              >
                <Link
                  to={`/applications/${a.application_id}`}
                  className="micro-link"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}
                >
                  <div>
                    <strong>{a.grant_title}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      Deadline {formatDate(a.deadline)}
                      {a.days_until !== null && (
                        <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: a.alert === 'overdue' ? '#dc2626' : '#d97706' }}>
                          {a.alert === 'overdue' ? `${Math.abs(a.days_until)} days overdue` : `${a.days_until} days left`}
                        </span>
                      )}
                      {' · '}
                      {a.status}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: a.alert === 'overdue' ? '#dc2626' : '#d97706',
                      color: 'white',
                    }}
                  >
                    {a.alert === 'overdue' ? 'Overdue' : 'Due soon'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {overdueCount > 0 && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              {overdueCount} application{overdueCount !== 1 ? 's' : ''} past deadline. Review and submit when ready.
            </p>
          )}
        </section>
      ) : alerts.length > 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          All deadlines on track. You have {alerts.length} active application{alerts.length !== 1 ? 's' : ''} in progress.
        </p>
      ) : null}

      {savedGrants.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            Saved grants
          </h2>
          <Link
            to="/grants"
            state={{ showFavorites: true }}
            className="micro-card micro-link"
            style={{
              padding: '1rem 1.25rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              color: 'inherit',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {savedGrants.slice(0, 5).map((g, i, arr) => (
                <li key={g.id} style={{ padding: '0.5rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                  <strong>{g.title}</strong>
                  {g.funder && <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}> · {g.funder}</span>}
                  <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {g.amount_max != null ? `Up to £${g.amount_max.toLocaleString()}` : '—'} · Deadline {formatDate(g.deadline)}
                  </span>
                </li>
              ))}
            </ul>
            {savedGrants.length > 5 && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-accent-start)' }}>
                +{savedGrants.length - 5} more · View all
              </p>
            )}
            {savedGrants.length <= 5 && savedGrants.length > 0 && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-accent-start)' }}>
                View all saved grants →
              </p>
            )}
          </Link>
        </section>
      )}

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
