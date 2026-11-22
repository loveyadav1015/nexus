import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Radio } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await loginUser(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-border-strong rounded-xl p-8 shadow-sm">
        {/* Brand identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-sidebar border border-border-strong text-accent flex items-center justify-center mb-3">
            <Radio size={20} />
          </div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">Nexus</h1>
          <p className="text-xs text-ink-muted mt-1 text-center">
            Sign in to your team workspace
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-danger font-medium"
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-ink-secondary"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 pr-9 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-primary transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="login-button"
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-2 bg-accent hover:bg-accent-hover text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle text-center">
          <p className="text-xs text-ink-muted">
            New here?{' '}
            <Link
              to="/register"
              className="text-accent hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
