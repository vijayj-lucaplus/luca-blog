import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="LucaPlus home"
      className={`inline-flex items-center font-heading text-3xl font-extrabold tracking-wide ${className ?? ''}`}
    >
      <span className="text-navy">LUCA</span>
      <span className="text-brand">PLUS</span>
    </Link>
  );
}
