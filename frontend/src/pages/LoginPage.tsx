import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/hooks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-primary-600 text-center mb-2">
          NeuroFlash
        </h1>
        <p className="text-center text-gray-600 mb-8">Login to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth isLoading={loading}>
            Login
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/register" className="text-sm text-primary-600 hover:text-primary-700">
            Don't have an account? Register
          </a>
        </div>
      </div>
    </div>
  );
}

