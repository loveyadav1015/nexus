import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await registerUser(username, email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] flex flex-col">
      <nav className="bg-[#1a1d21] border-b border-[#383a40] h-12 flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#4a55c8] rounded-full w-7 h-7 flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-white text-sm">Mini Slack</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-[#222529] rounded-xl p-8 w-[400px] shadow-2xl">
          <h1 className="text-xl font-semibold text-white mb-6 text-center">Create Your Account</h1>

          {error && <p className="text-[#e8502a] text-sm mb-4 text-center">{error}</p>}

          <div className="mb-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="register-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4a9eed] focus:ring-1 focus:ring-[#4a9eed] transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="register-email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4a9eed] focus:ring-1 focus:ring-[#4a9eed] transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4a9eed] focus:ring-1 focus:ring-[#4a9eed] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="register-button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#4a55c8] hover:bg-[#5561d4] text-white font-semibold py-2.5 rounded-lg transition-colors active:scale-95 transition-transform duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <p className="text-gray-400 text-sm text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-white hover:underline cursor-pointer">
              Log In
            </Link>
          </p>
        </div>
      </div>

      <footer className="text-xs text-gray-500 text-center py-4 flex-shrink-0">
        © {new Date().getFullYear()} Mini Slack. All rights reserved. Privacy Policy | Terms of Service.
      </footer>
    </div>
  );
};

export default Register;
