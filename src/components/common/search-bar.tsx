'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed) router.push(`/blog?q=${encodeURIComponent(trimmed)}`);
      }}
      className={`flex items-center ${className ?? ''}`}
    >
      <label htmlFor="site-search" className="sr-only">
        Search articles
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search…"
        className="w-32 rounded-l-md border border-surface-100 px-3 py-1.5 text-sm text-ink outline-none focus:border-brand sm:w-44"
      />
      <button
        type="submit"
        aria-label="Search"
        className="rounded-r-md bg-brand px-3 py-1.5 text-white transition-colors hover:bg-brand-dark"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
