import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { AppShell } from '../components/AppShell';
import { Avatar } from '../components/Avatar';

const AVATAR_COLORS = ['#f72585', '#4cc9f0', '#b8f397', '#ffb347', '#7209b7', '#5eead4', '#ff6b6b'];

export function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  type Tab = 'profile' | 'security' | 'preferences' | 'team';
  const [tab, setTab] = useState<Tab>('profile');

  if (!user) return null;

  return (
    <AppShell>
      <header className="border-b border-white/10 px-4 py-6 md:px-8">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-mist">Profile, security, preferences, and team</p>
      </header>

      <div className="flex flex-col gap-6 p-4 md:flex-row md:p-8">
        <div className="flex shrink-0 gap-2 md:w-48 md:flex-col">
          {(
            [
              ['profile', 'Profile'],
              ['security', 'Password'],
              ['preferences', 'Preferences'],
              ...(user.role === 'admin' ? [['team', 'Team'] as [Tab, string]] : []),
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`rounded-lg px-3 py-2 text-left text-sm ${
                tab === id ? 'bg-pulse-magenta/25 font-medium text-white' : 'text-mist hover:bg-white/5'
              }`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1 max-w-2xl rounded-2xl border border-white/10 bg-ink-card p-6">
          {tab === 'profile' && <ProfileSection user={user} onSaved={refreshUser} />}
          {tab === 'security' && <PasswordSection />}
          {tab === 'preferences' && <PreferencesSection user={user} onSaved={refreshUser} />}
          {tab === 'team' && user.role === 'admin' && <TeamSection />}
        </div>
      </div>

      <div className="px-8 pb-8">
        <button type="button" className="btn-ghost text-sm" onClick={() => logout()}>
          Sign out of all sessions on this device
        </button>
      </div>
    </AppShell>
  );
}

function ProfileSection({ user, onSaved }: { user: NonNullable<ReturnType<typeof useAuth>['user']>; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [color, setColor] = useState(user.avatarColor);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function save() {
    setErr('');
    try {
      await api.updateProfile({ name, avatarColor: color });
      await onSaved();
      setMsg('Profile saved.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold">Profile</h2>
      <p className="mt-1 text-sm text-mist">How you appear on issues and activity.</p>
      <div className="mt-6 flex items-center gap-4">
        <Avatar name={name} color={color} />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-mist-dim">{user.role}</p>
        </div>
      </div>
      <label className="mt-6 block text-xs text-mist-dim">Display name</label>
      <input className="field-input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="mt-4 block text-xs text-mist-dim">Email</label>
      <input className="field-input mt-1 opacity-70" value={user.email} readOnly />
      <label className="mt-4 block text-xs text-mist-dim">Avatar color</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {AVATAR_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`h-8 w-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      {msg && <p className="mt-3 text-sm text-pulse-mint">{msg}</p>}
      {err && <p className="mt-3 text-sm text-pulse-coral">{err}</p>}
      <button type="button" className="btn-primary mt-6" onClick={() => void save()}>Save profile</button>
    </div>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function save() {
    setErr('');
    setMsg('');
    if (next !== confirm) {
      setErr('New passwords do not match');
      return;
    }
    try {
      await api.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setMsg('Password updated.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed');
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold">Change password</h2>
      <p className="mt-1 text-sm text-mist">Use at least 8 characters.</p>
      <label className="mt-6 block text-xs text-mist-dim">Current password</label>
      <input type="password" className="field-input mt-1" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <label className="mt-4 block text-xs text-mist-dim">New password</label>
      <input type="password" className="field-input mt-1" value={next} onChange={(e) => setNext(e.target.value)} />
      <label className="mt-4 block text-xs text-mist-dim">Confirm new password</label>
      <input type="password" className="field-input mt-1" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {msg && <p className="mt-3 text-sm text-pulse-mint">{msg}</p>}
      {err && <p className="mt-3 text-sm text-pulse-coral">{err}</p>}
      <button type="button" className="btn-primary mt-6" onClick={() => void save()}>Update password</button>
    </div>
  );
}

function PreferencesSection({
  user,
  onSaved,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  onSaved: () => Promise<void>;
}) {
  const s = user.settings;
  const [defaultView, setDefaultView] = useState(s.defaultView);
  const [emailOnAssignment, setEmailOnAssignment] = useState(s.emailOnAssignment);
  const [compactCards, setCompactCards] = useState(s.compactCards);
  const [timezone, setTimezone] = useState(s.timezone);
  const [msg, setMsg] = useState('');

  async function save() {
    await api.updateSettings({ defaultView, emailOnAssignment, compactCards, timezone });
    await onSaved();
    setMsg('Preferences saved.');
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold">Preferences</h2>
      <p className="mt-1 text-sm text-mist">Workspace defaults for your account.</p>
      <label className="mt-6 block text-xs text-mist-dim">Default issues view</label>
      <select className="field-input mt-1 w-auto" value={defaultView} onChange={(e) => setDefaultView(e.target.value as 'board' | 'list')}>
        <option value="board">Board</option>
        <option value="list">List</option>
      </select>
      <label className="mt-4 flex items-center gap-2 text-sm text-mist">
        <input type="checkbox" checked={emailOnAssignment} onChange={(e) => setEmailOnAssignment(e.target.checked)} />
        Email me when assigned to an issue
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm text-mist">
        <input type="checkbox" checked={compactCards} onChange={(e) => setCompactCards(e.target.checked)} />
        Compact cards on board
      </label>
      <label className="mt-4 block text-xs text-mist-dim">Timezone</label>
      <input className="field-input mt-1" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC, Asia/Kolkata…" />
      {msg && <p className="mt-3 text-sm text-pulse-mint">{msg}</p>}
      <button type="button" className="btn-primary mt-6" onClick={() => void save()}>Save preferences</button>
    </div>
  );
}

function TeamSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'member' | 'viewer' | 'admin'>('member');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function create() {
    setErr('');
    try {
      await api.createUser({ name, email, password, role });
      setMsg(`User ${email} created. They can sign in with the password you set.`);
      setName('');
      setEmail('');
      setPassword('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed');
    }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold">Create user</h2>
      <p className="mt-1 text-sm text-mist">Add teammates with email and password (admin only).</p>
      <label className="mt-6 block text-xs text-mist-dim">Full name</label>
      <input className="field-input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="mt-4 block text-xs text-mist-dim">Email</label>
      <input type="email" className="field-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="mt-4 block text-xs text-mist-dim">Password</label>
      <input type="password" className="field-input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label className="mt-4 block text-xs text-mist-dim">Role</label>
      <select className="field-input mt-1 w-auto" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
        <option value="member">Member</option>
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>
      {msg && <p className="mt-3 text-sm text-pulse-mint">{msg}</p>}
      {err && <p className="mt-3 text-sm text-pulse-coral">{err}</p>}
      <button type="button" className="btn-primary mt-6" onClick={() => void create()}>Create user</button>
    </div>
  );
}
