'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Login failed.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-surface-100 bg-white p-8 shadow-sm"
      >
        <div className="text-center font-heading text-2xl font-extrabold tracking-wide">
          <span className="text-navy">LUCA</span>
          <span className="text-brand">PLUS</span>
        </div>
        <h1 className="mt-2 text-center text-sm font-semibold uppercase tracking-wide text-muted">
          Admin sign in
        </h1>

        <label className="mt-6 block text-sm">
          <span className="mb-1 block font-semibold text-navy">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-surface-100 px-3 py-2 text-ink"
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-semibold text-navy">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-surface-100 px-3 py-2 text-ink"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-orange">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-gold px-4 py-2.5 font-heading font-semibold text-navy transition hover:bg-orange disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
