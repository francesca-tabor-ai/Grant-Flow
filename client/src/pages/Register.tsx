import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name || undefined);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Create an account</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        One profile. Reused across grants and applications.
      </p>
      <form onSubmit={handleSubmit}>
        {error && (
          <p style={{ color: '#b91c1c', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
        )}
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
          }}
        />
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
          Register
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
