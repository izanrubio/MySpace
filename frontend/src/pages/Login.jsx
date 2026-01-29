import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiGithub, FiMail, FiLock, FiUser, FiZap } from 'react-icons/fi';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await register(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 mb-4">
            <FiZap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to MySpace</h1>
          <p className="text-slate-400">Your personal workspace manager</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FiUser size={16} />
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FiMail size={16} />
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FiLock size={16} />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-transparent text-slate-400">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
              window.location.href = `${API_URL}/api/auth/github`;
            }}
            className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium flex items-center justify-center gap-3 transition-all group"
          >
            <FiGithub size={20} className="group-hover:scale-110 transition-transform" />
            Continue with GitHub
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
