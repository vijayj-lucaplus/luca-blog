import Link from 'next/link';
import { LogoutButton } from '@/components/admin/logout-button';

const NAV = [
  { href: '/admin', label: 'Dashboard', key: 'dashboard' },
  { href: '/admin/posts', label: 'Posts', key: 'posts' },
  { href: '/admin/campaigns', label: 'Campaigns', key: 'campaigns' },
];

export function AdminShell({
  email,
  active,
  children,
}: {
  email: string;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-heading font-extrabold tracking-wide">
              LUCA<span className="text-brand">PLUS</span>{' '}
              <span className="text-sm font-normal text-white/60">Admin</span>
            </span>
            <nav className="flex gap-4">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    active === item.key ? 'text-brand' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-white/80 hover:text-white">
              View site →
            </Link>
            <span className="hidden text-white/60 sm:inline">{email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
