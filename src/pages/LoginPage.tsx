import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('johndoe');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(username);
      // Successful login redirects via AuthContext
    } catch (err) {
      setError('Login failed. Please check your username and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 card">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary text-white">
            <ClipboardCheck size={32} />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text-primary">Sign in to EVV Portal</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your username to access your caregiver dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-error">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm text-text-muted">
            <p>For demo, use username: "johndoe"</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;