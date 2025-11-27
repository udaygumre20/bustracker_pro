import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BusIcon, CloseIcon, EyeIcon, EyeOffIcon } from '../components/icons';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-neutral-900">
      {/* Top Section - Primary Color with Gradient */}
      <div className="bg-gradient-to-br from-primary to-blue-600 h-1/3 min-h-[300px] flex flex-col items-center justify-center relative rounded-b-[3rem] shadow-strong z-10">
        <button
          onClick={onBack}
          className="absolute top-6 right-6 text-white/90 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all active:scale-95"
        >
          <CloseIcon className="w-8 h-8" />
        </button>

        <div className="bg-white/20 p-7 rounded-2xl mb-6 backdrop-blur-md shadow-lg">
          <BusIcon className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">BusTracker Pro</h1>
        <p className="text-blue-100 font-semibold">Driver & Admin Portal</p>
      </div>

      {/* Bottom Section - Form */}
      <div className="flex-grow flex items-center justify-center p-6 -mt-12">
        <div className="w-full max-w-md card p-8 shadow-strong animate-scale-in">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-8 font-medium">Please sign in to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 dark:bg-danger/20 text-danger p-4 rounded-xl text-sm font-semibold border border-danger/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base shadow-glow-primary hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
