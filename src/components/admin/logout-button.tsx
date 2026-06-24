'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
      }}
      className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20"
    >
      Log out
    </button>
  );
}
