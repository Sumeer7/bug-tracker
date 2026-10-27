import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-ink-soft/90 p-4 md:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pulse-magenta to-pulse-amber text-lg font-bold text-ink">
            P
          </span>
          <div>
            <p className="font-display text-sm font-bold">Pulse Track</p>
            <p className="text-[10px] text-mist-dim">Issue & bug tracker</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1 text-sm">
          <ShellNav to="/">Issues</ShellNav>
          <ShellNav to="/settings">Settings</ShellNav>
        </nav>
        {user && (
          <button
            type="button"
            className="mt-auto flex w-full items-center gap-2 rounded-xl border border-white/10 bg-ink-card p-3 text-left transition hover:border-pulse-magenta/40"
            onClick={() => navigate('/settings')}
          >
            <Avatar name={user.name} color={user.avatarColor} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-mist-dim">{user.email}</p>
            </div>
          </button>
        )}
        <button type="button" className="btn-ghost mt-2 w-full text-xs" onClick={() => { logout(); navigate('/login'); }}>
          Sign out
        </button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function ShellNav({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 ${isActive ? 'bg-white/10 font-medium text-white' : 'text-mist hover:bg-white/5'}`
      }
    >
      {children}
    </NavLink>
  );
}
