import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { Button, Input } from '../components/ui';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(password);
    setIsLoading(false);

    if (success) {
      navigate('/editor');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Forever Party Rentals" className="h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-brand-green">Tent Mapper</h1>
          <p className="text-brand-green/70 mt-2">
            Event Planning Tool
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-pink rounded-full mb-3">
              <Lock size={24} className="text-brand-green" />
            </div>
            <h2 className="text-xl font-semibold text-brand-green">Staff Login</h2>
            <p className="text-sm text-brand-green/60 mt-1">
              Enter the staff password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                error={error}
                className="pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-brand-green/50 hover:text-brand-green"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!password || isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-brand-green/10 text-center">
            <p className="text-xs text-brand-green/50">
              Need access? Contact your administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-brand-green/50 mt-8">
          &copy; {new Date().getFullYear()} Forever Party Rentals
        </p>
      </div>
    </div>
  );
};
