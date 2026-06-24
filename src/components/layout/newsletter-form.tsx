'use client';

import { useState, type FormEvent } from 'react';

export function NewsletterForm({
  source = 'footer',
  tone = 'dark',
}: {
  source?: string;
  tone?: 'dark' | 'light';
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(data.message ?? 'Please check your inbox to confirm.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  const inputClass =
    tone === 'light'
      ? 'border-white/20 bg-white/10 text-white placeholder:text-white/60'
      : 'border-surface-100 bg-white text-ink placeholder:text-muted';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full max-w-md items-stretch">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address…"
          aria-label="Email address"
          className={`min-w-0 flex-1 rounded-l-md border px-3 py-2 text-sm outline-none focus:border-brand ${inputClass}`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-r-md bg-gold px-4 py-2 text-sm font-heading font-semibold text-navy transition-colors hover:bg-orange disabled:opacity-60"
        >
          {status === 'loading' ? '…' : 'Subscribe'}
        </button>
      </div>
      {message ? (
        <p
          className={`mt-2 text-xs ${
            status === 'error'
              ? 'text-orange'
              : tone === 'light'
                ? 'text-white/80'
                : 'text-brand-dark'
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
