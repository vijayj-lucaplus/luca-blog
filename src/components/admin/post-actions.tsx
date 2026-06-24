'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PostActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm('Delete this post permanently?')) return;
    setBusy(true);
    await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={remove}
      className="rounded border border-surface-100 px-2.5 py-1 text-xs font-semibold text-muted hover:text-orange disabled:opacity-60"
    >
      Delete
    </button>
  );
}
