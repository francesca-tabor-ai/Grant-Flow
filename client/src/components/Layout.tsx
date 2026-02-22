import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import ChatWidget from './ChatWidget';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/organizations', label: 'Organisations' },
  { path: '/grants', label: 'Grants' },
  { path: '/applications', label: 'Applications' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'saturate(180%) blur(12px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.125rem',
              }}
            >
              G
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                GrantFlow AI
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Grants & applications
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', paddingLeft: 8 }}>
            Platform
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 12px',
                      borderRadius: 12,
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-accent-start)' : 'var(--color-text-secondary)',
                      background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: '2rem', paddingLeft: 8 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Actions
            </div>
            <Link
              to="/grants"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              New application
            </Link>
          </div>
        </nav>

        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 12, background: 'rgba(0,0,0,0.03)' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--color-accent-start)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
              title="Log out"
            >
              Out
            </button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem 2rem', maxWidth: 1200, margin: 0 }}>
        <Outlet />
      </main>
      <ChatWidget />
    </div>
  );
}
