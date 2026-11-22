import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Radio } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await registerUser(username, email, password);
    if (!result.success) {
      setError(result.error || 'Failed to create account. Please try again.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-border-strong rounded-xl p-8 shadow-sm">
        {/* Brand identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-sidebar border border-border-strong text-accent flex items-center justify-center mb-3">
            <Radio size={20} />
          </div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">Create your Nexus account</h1>
          <p className="text-xs text-ink-muted mt-1 text-center">
            Join your team on a calm, focused workspace
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
              htmlFor="register-username"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                id="register-username"
                type="text"
                placeholder="alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-input border border-border-strong rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                id="register-email"
                type="email"
                placeholder="alice@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-input border border-border-strong rounded-lg pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Password (6+ characters)
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-input border border-border-strong rounded-lg pl-9 pr-9 py-2 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
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
            id="register-button"
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-2 bg-accent hover:bg-accent-hover text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle text-center">
          <p className="text-xs text-ink-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
