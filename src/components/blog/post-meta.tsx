import type { PostDTO } from '@/types/blog';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PostMeta({
  post,
  className,
  tone = 'muted',
  views,
}: {
  post: Pick<PostDTO, 'author' | 'publishedAt' | 'readingTimeMinutes'>;
  className?: string;
  tone?: 'muted' | 'light';
  views?: number;
}) {
  const color = tone === 'light' ? 'text-white/70' : 'text-muted';
  return (
    <p className={`text-xs ${color} ${className ?? ''}`}>
      {post.author}
      {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ''}
      {` · ${post.readingTimeMinutes} min read`}
      {typeof views === 'number' ? ` · ${views} view${views === 1 ? '' : 's'}` : ''}
    </p>
  );
}
