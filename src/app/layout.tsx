import type { Metadata } from 'next';
import { Hind, Montserrat } from 'next/font/google';
import './globals.css';
import { SITE } from '@/config/constants';
import { JsonLd } from '@/components/common/json-ld';
import { organizationJsonLd } from '@/lib/seo/json-ld';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const hind = Hind({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${hind.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-ink">
        <JsonLd data={organizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
