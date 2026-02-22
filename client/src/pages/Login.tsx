import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sign in</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        GrantFlow AI — grant management for CICs.
      </p>
      <form onSubmit={handleSubmit}>
        {error && (
          <p style={{ color: '#b91c1c', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
        )}
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
          }}
        />
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            fontWeight: 600,
          }}
        >
          Sign in
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
