import Link from 'next/link';
import { SocialIcons } from '@/components/common/social-icons';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { CATEGORIES, SITE } from '@/config/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-heading text-2xl font-extrabold tracking-wide">
            <span className="text-white">LUCA</span>
            <span className="text-brand">PLUS</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-white/70">{SITE.description}</p>
          <SocialIcons variant="light" className="mt-4" />
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-white/90">
            Categories
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="hover:text-brand">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-white/90">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li><Link href="/blog" className="hover:text-brand">All articles</Link></li>
            <li><a href="/rss.xml" className="hover:text-brand">RSS feed</a></li>
            <li><a href="/sitemap.xml" className="hover:text-brand">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-white/90">
            Subscribe
          </h2>
          <p className="mt-4 mb-3 text-sm text-white/70">
            Get practical finance and invoicing tips in your inbox.
          </p>
          <NewsletterForm source="footer" tone="light" />
        </div>
      </div>

      <div className="border-t border-navy-light py-4 text-center text-sm text-white/60">
        © {year} {SITE.name}. Articles are general information only, not financial advice.
      </div>
    </footer>
  );
}
