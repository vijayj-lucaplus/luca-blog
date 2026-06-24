'use client';

import { useEffect, useState } from 'react';
import { NewsletterForm } from '@/components/layout/newsletter-form';

const DISMISS_KEY = 'lp_news_dismissed';

export function NewsletterBar() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(window.localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-navy text-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-content flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between">
        <p className="font-heading text-sm font-semibold sm:text-base">
          Stay Connected — subscribe to our newsletter
        </p>
        <div className="flex items-center gap-3">
          <NewsletterForm source="newsletter-bar" tone="light" />
          <button
            type="button"
            aria-label="Dismiss newsletter bar"
            onClick={() => {
              window.localStorage.setItem(DISMISS_KEY, '1');
              setHidden(true);
            }}
            className="text-white/70 transition-colors hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
