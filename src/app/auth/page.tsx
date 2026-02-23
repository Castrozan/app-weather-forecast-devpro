'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { weatherApiClient } from '@/features/weather/api/weatherApiClient';

export default function AuthPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await weatherApiClient.signIn(token.trim());
      router.push('/');
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Failed to validate access token.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <form onSubmit={onSubmit} className="auth-form">
        <h1>Access Required</h1>
        <label htmlFor="access-token">Access token</label>
        <input
          id="access-token"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Enter app token"
        />
        {error ? <p className="status-message">{error}</p> : null}
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Validating...' : 'Enter'}
        </button>
      </form>
    </main>
  );
}
