import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const AUTH_IMAGE = "https://images.unsplash.com/photo-1640346876473-f76a73c71539?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGRhcmslMjBtaW5pbWFsJTIwZ2VvbWV0cnl8ZW58MHx8fHwxNzc0NDQwNzcxfDA&ixlib=rb-4.1.0&q=85";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.signup({ name, email, password });
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split" data-testid="signup-page">
      <div
        className="auth-image"
        style={{ backgroundImage: `url(${AUTH_IMAGE})` }}
      />
      <div className="flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 bg-black min-h-screen">
        <div className="max-w-sm w-full">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-3">
              Task Manager
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Create account
            </h1>
            <p className="text-neutral-400 font-light mt-2 text-sm">
              Get started with managing your tasks efficiently.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-2">
                Full Name
              </label>
              <input
                data-testid="signup-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:outline-none focus:border-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-2">
                Email
              </label>
              <input
                data-testid="signup-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:outline-none focus:border-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  data-testid="signup-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:outline-none focus:border-white pr-10"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  data-testid="toggle-signup-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              data-testid="signup-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 text-sm tracking-wide hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-neutral-500 mt-8">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-white hover:underline font-medium"
              data-testid="login-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
