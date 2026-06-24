import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

/**
 * Renders AI-generated Markdown safely. rehype-sanitize strips any unsafe HTML
 * (we never use dangerouslySetInnerHTML on model output), remark-gfm adds
 * tables/lists. External links open in a new tab with rel protections.
 */
export function PostContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose-article max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a({ href, children }) {
            const external = !!href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
