'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CampaignActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: 'send' | 'delete') {
    if (action === 'delete' && !window.confirm('Delete this campaign?')) return;
    setBusy(true);
    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {status !== 'sent' && status !== 'sending' ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => run('send')}
          className="rounded bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          Send now
        </button>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => run('delete')}
        className="rounded border border-surface-100 px-2.5 py-1 text-xs font-semibold text-muted hover:text-orange disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
