import Link from 'next/link';
import { CATEGORIES } from '@/config/constants';

const linkClass =
  'font-heading text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:text-brand';

export function PrimaryNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-surface-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className={linkClass}>
          Home
        </Link>
        {CATEGORIES.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`} className={linkClass}>
            {category.name}
          </Link>
        ))}
        <Link href="/blog" className={linkClass}>
          Blog
        </Link>
      </div>
    </nav>
  );
}
