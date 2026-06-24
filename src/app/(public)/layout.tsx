import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { NewsletterBar } from '@/components/layout/newsletter-bar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[50vh] pb-24">{children}</main>
      <Footer />
      <NewsletterBar />
    </>
  );
}
