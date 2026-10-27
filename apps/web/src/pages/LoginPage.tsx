import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-mist">Loading…</div>;
  }
  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setShowCreatePrompt(false);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      const message = err instanceof Error ? err.message : 'Sign in failed';
      if (code === 'EMAIL_NOT_FOUND') {
        setShowCreatePrompt(true);
        setError('This email is not registered yet.');
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  const registerHref = `/register${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-card p-8 shadow-glow">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pulse-magenta to-pulse-amber text-xl font-bold text-ink">
            P
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">Pulse Track</h1>
            <p className="text-sm text-mist">Sign in with your email and password</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-3 sm:space-y-0 sm:flex sm:gap-2 sm:items-end">
            <div className="flex-1">
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
            <div className="flex-1">
              <label className="text-xs font-medium text-mist-dim">Password</label>
              <input
                type="password"
                className="field-input mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary shrink-0 px-6" disabled={busy}>
            {busy ? '…' : 'Sign in'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg bg-pulse-coral/15 px-3 py-2 text-sm text-pulse-coral">
            <p>{error}</p>
            {showCreatePrompt && (
              <p className="mt-2 text-mist">
                <Link to={registerHref} className="font-semibold text-pulse-amber underline underline-offset-2">
                  Create an account
                </Link>{' '}
                to get started.
              </p>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-mist">
          New here?{' '}
          <Link to="/register" className="font-medium text-pulse-mint hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
