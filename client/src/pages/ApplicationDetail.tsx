import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, getToken } from '../lib/api';

type ApplicationDetailData = {
  id: string;
  status: string;
  deadline: string | null;
  submitted_at: string | null;
  grant_title: string;
  funder: string | null;
  grant_deadline: string | null;
  grant_description: string | null;
};

type Proposal = {
  id: string;
  application_id: string;
  version: number;
  content: string | null;
  created_at: string;
};

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationDetailData | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [patching, setPatching] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/applications/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Application not found');
        return r.json();
      })
      .then((data) => {
        setApplication(data);
        return apiFetch(`/api/applications/${id}/proposals`).then((r) => (r.ok ? r.json() : []));
      })
      .then((list) => setProposals(Array.isArray(list) ? list : []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const generateProposal = () => {
    if (!id) return;
    setGenerating(true);
    apiFetch(`/api/applications/${id}/proposals/generate`, { method: 'POST' })
      .then((r) => {
        if (!r.ok) throw new Error('Generate failed');
        return apiFetch(`/api/applications/${id}/proposals`).then((res) => (res.ok ? res.json() : []));
      })
      .then((list) => setProposals(Array.isArray(list) ? list : []))
      .catch(() => setError('Failed to generate proposal'))
      .finally(() => setGenerating(false));
  };

  const updateStatus = (status: string) => {
    if (!id) return;
    setPatching(true);
    apiFetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setApplication((prev) => (prev ? { ...prev, ...data } : null)))
      .finally(() => setPatching(false));
  };

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');
  const latestProposal = proposals.length > 0 ? proposals[0] : null;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading…
      </div>
    );
  }
  if (error || !application) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>{error || 'Application not found'}</p>
        <Link to="/applications" style={{ color: 'var(--color-accent-start)', fontWeight: 600 }}>
          ← Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/applications"
          style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'inline-block' }}
        >
          ← Applications
        </Link>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: application.status === 'submitted' ? '#dcfce7' : application.status === 'in_progress' ? '#fef3c7' : '#f3f4f6',
              marginBottom: '0.5rem',
            }}
          >
            {application.status}
          </span>
          <h1 style={{ fontWeight: 700, fontSize: '1.5rem', margin: '0.25rem 0', color: 'var(--color-text)' }}>
            {application.grant_title}
          </h1>
          {application.funder && (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1rem' }}>{application.funder}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {application.status === 'draft' && !latestProposal?.content && (
            <button
              type="button"
              onClick={generateProposal}
              disabled={generating}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                color: '#fff',
                fontWeight: 600,
                cursor: generating ? 'wait' : 'pointer',
              }}
            >
              {generating ? 'Generating…' : 'Generate proposal'}
            </button>
          )}
          {['draft', 'in_progress', 'submitted'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateStatus(s)}
              disabled={patching || application.status === s}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                background: application.status === s ? 'var(--color-accent-start)' : 'var(--color-bg)',
                color: application.status === s ? '#fff' : 'var(--color-text)',
                cursor: patching ? 'wait' : 'pointer',
              }}
            >
              {s}
            </button>
          ))}
          {latestProposal?.content && (
            <>
              <button
                type="button"
                onClick={() => {
                  const t = getToken();
                  const h = new Headers();
                  if (t) h.set('Authorization', `Bearer ${t}`);
                  fetch(`/api/applications/${id}/export/pdf`, { headers: h })
                    .then((r) => r.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `proposal-${id?.slice(0, 8)}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = getToken();
                  const h = new Headers();
                  if (t) h.set('Authorization', `Bearer ${t}`);
                  fetch(`/api/applications/${id}/export/docx`, { headers: h })
                    .then((r) => r.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `proposal-${id?.slice(0, 8)}.docx`;
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                Export Word
              </button>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          background: 'rgba(0,0,0,0.02)',
        }}
      >
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          About this grant
        </h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {application.grant_description || 'No description.'}
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Deadline: {formatDate(application.grant_deadline)}
        </p>
      </div>

      {generating && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Generating proposal…
        </div>
      )}
      {latestProposal?.content && !generating && (
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Proposal draft (v{latestProposal.version})
          </h3>
          <textarea
            readOnly
            value={latestProposal.content}
            style={{
              width: '100%',
              minHeight: 320,
              padding: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: 1.6,
              resize: 'vertical',
            }}
          />
        </div>
      )}
      {!latestProposal?.content && !generating && application.status === 'draft' && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'rgba(0,0,0,0.02)',
          }}
        >
          <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Generate a first draft using AI based on your organisation and this grant.
          </p>
          <button
            type="button"
            onClick={generateProposal}
            disabled={generating}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--color-accent-start)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Generate first draft
          </button>
        </div>
      )}
    </div>
  );
}
