import { SITE } from '@/config/constants';

const ICONS: Record<string, string> = {
  facebook: 'M13 22v-8h2.7l.4-3H13V9.2c0-.9.3-1.5 1.6-1.5H16V5.1A21 21 0 0 0 13.7 5C11.4 5 10 6.3 10 8.9V11H7.3v3H10v8h3z',
  twitter:
    'M18.9 3H22l-7.3 8.3L23 21h-6.4l-5-6.1L5.8 21H2.6l7.8-8.9L1.7 3h6.6l4.5 5.6L18.9 3z',
  instagram:
    'M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.8-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM20 8.8c-.1-1.4-.4-2.6-1.4-3.6S16.4 3.7 15 3.6C13.6 3.5 10.4 3.5 9 3.6c-1.4.1-2.6.4-3.6 1.4S3.7 7.4 3.6 8.8C3.5 10.2 3.5 13.8 3.6 15.2c.1 1.4.4 2.6 1.4 3.6s2.2 1.3 3.6 1.4c1.4.1 4.6.1 6 0 1.4-.1 2.6-.4 3.6-1.4s1.3-2.2 1.4-3.6c.1-1.4.1-5 0-6.4zM18 16.7c-.3.7-.8 1.3-1.5 1.6-1 .4-3.5.3-4.7.3s-3.7.1-4.7-.3c-.7-.3-1.3-.9-1.6-1.6-.4-1-.3-3.5-.3-4.7s-.1-3.7.3-4.7c.3-.7.9-1.3 1.6-1.6 1-.4 3.5-.3 4.7-.3s3.7-.1 4.7.3c.7.3 1.3.9 1.6 1.6.4 1 .3 3.5.3 4.7s.1 3.7-.3 4.7z',
  youtube:
    'M22 8.2c-.2-1.4-.8-2.1-2.2-2.3C18 5.5 12 5.5 12 5.5s-6 0-7.8.4C2.8 6.1 2.2 6.8 2 8.2 1.7 9.7 1.7 12 1.7 12s0 2.3.3 3.8c.2 1.4.8 2.1 2.2 2.3 1.8.4 7.8.4 7.8.4s6 0 7.8-.4c1.4-.2 2-.9 2.2-2.3.3-1.5.3-3.8.3-3.8s0-2.3-.3-3.8zM10 15V9l5.2 3-5.2 3z',
};

export function SocialIcons({
  variant = 'navy',
  className,
}: {
  variant?: 'navy' | 'light';
  className?: string;
}) {
  const base = variant === 'light' ? 'text-white/80 hover:text-white' : 'text-navy hover:text-brand';
  const links: { key: keyof typeof SITE.social; label: string }[] = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'twitter', label: 'X (Twitter)' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
  ];

  return (
    <div className={`flex items-center gap-4 ${className ?? ''}`}>
      {links.map(({ key, label }) => (
        <a
          key={key}
          href={SITE.social[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`transition-colors ${base}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d={ICONS[key]} />
          </svg>
        </a>
      ))}
    </div>
  );
}
