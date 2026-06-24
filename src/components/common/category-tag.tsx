import Link from 'next/link';
import type { TagVariant } from '@/types/blog';

const VARIANTS: Record<TagVariant, string> = {
  teal: 'bg-brand text-white',
  navy: 'bg-navy text-white',
  gold: 'bg-gold text-navy',
  brand: 'bg-brand-light text-navy',
};

export function CategoryTag({
  name,
  href,
  variant,
}: {
  name: string;
  href?: string;
  variant: TagVariant;
}) {
  const className = `inline-block rounded px-2.5 py-1 text-[11px] font-heading font-semibold uppercase tracking-wide ${VARIANTS[variant]}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}
