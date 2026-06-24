'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '@/config/constants';

export function GenerateButton() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function run() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorySlug: category || undefined }),
      });
      const data = await response.json();
      setMessage(data.message ?? data.error ?? 'Done.');
      router.refresh();
    } catch {
      setMessage('Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-surface-100 bg-white p-5">
      <h2 className="font-heading text-lg font-bold text-navy">Generate a post now</h2>
      <p className="mt-1 text-sm text-muted">
        Runs the full AI pipeline once. Auto-publishes if it passes validation and
        the quality threshold; otherwise it is saved as a draft.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-md border border-surface-100 px-3 py-2 text-sm text-ink"
        >
          <option value="">Auto (rotate by day)</option>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-md bg-brand px-4 py-2 font-heading text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Generating…' : 'Generate now'}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-navy">{message}</p> : null}
    </div>
  );
}
