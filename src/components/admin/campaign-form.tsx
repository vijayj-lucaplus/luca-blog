'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type Mode = 'manual' | 'digest' | 'ai';

export function CampaignForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('manual');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [product, setProduct] = useState('lucaplus');
  const [audience, setAudience] = useState('confirmed');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sendNow, setSendNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          mode,
          subject: subject || undefined,
          bodyHtml: mode === 'manual' ? bodyHtml : undefined,
          product,
          audience,
          scheduledAt: scheduledAt || undefined,
          sendNow,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Campaign created.');
        setSubject('');
        setBodyHtml('');
        setScheduledAt('');
        setSendNow(false);
        router.refresh();
      } else {
        setMessage(data.error ?? 'Failed to create campaign.');
      }
    } catch {
      setMessage('Request failed.');
    } finally {
      setLoading(false);
    }
  }

  const field = 'w-full rounded-md border border-surface-100 px-3 py-2 text-sm text-ink';

  return (
    <form onSubmit={submit} className="rounded-xl border border-surface-100 bg-white p-5">
      <h2 className="font-heading text-lg font-bold text-navy">New campaign</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Type</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={field}>
            <option value="manual">Manual (write your own)</option>
            <option value="digest">Digest (recent posts)</option>
            <option value="ai">AI-drafted promo</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Audience</span>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={field}>
            <option value="confirmed">Confirmed subscribers</option>
            <option value="all">All (excl. unsubscribed)</option>
          </select>
        </label>

        {mode === 'ai' ? (
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-navy">Promote product</span>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className={field}>
              <option value="lucaplus">LucaPlus</option>
              <option value="lucapay">LucaPay</option>
            </select>
          </label>
        ) : null}

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">
            Subject {mode !== 'manual' ? '(optional — auto if blank)' : ''}
          </span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={field} placeholder="Subject line" />
        </label>
      </div>

      {mode === 'manual' ? (
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-semibold text-navy">Content (HTML)</span>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={6}
            className={field}
            placeholder="<p>Hello!</p>"
          />
        </label>
      ) : (
        <p className="mt-4 rounded-md bg-surface-50 p-3 text-sm text-muted">
          {mode === 'digest'
            ? 'A digest of posts published in the last 14 days will be generated automatically.'
            : 'NVIDIA NIM will draft the promotional email for the selected product.'}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-navy">Schedule (optional)</span>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className={field}
          />
        </label>
        <label className="mt-5 flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={sendNow}
            disabled={!!scheduledAt}
            onChange={(e) => setSendNow(e.target.checked)}
          />
          Send immediately
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded-md bg-brand px-4 py-2 font-heading text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? 'Working…' : 'Create campaign'}
      </button>
      {message ? <p className="mt-3 text-sm text-navy">{message}</p> : null}
    </form>
  );
}
