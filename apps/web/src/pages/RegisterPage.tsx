import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const emailFromQuery = params.get('email') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-mist">Loading…</div>;
  }
  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-card p-8 shadow-glow">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pulse-magenta to-pulse-amber text-xl font-bold text-ink">
            P
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">Create account</h1>
            <p className="text-sm text-mist">Set up your Pulse Track login</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-mist-dim">Full name</label>
            <input
              type="text"
              className="field-input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mist-dim">Email</label>
            <input
              type="email"
              className="field-input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-mist-dim">Password</label>
            <input
              type="password"
              className="field-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-pulse-coral">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-mist">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-pulse-mint hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
