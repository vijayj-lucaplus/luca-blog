import { escapeHtml } from '@/lib/text';
import type { PostDTO } from '@/types/blog';

const NAVY = '#203060';
const TEAL = '#1cbd99';
const GOLD = '#fec257';

/** Branded HTML email shell with optional unsubscribe footer. */
export function wrapEmail(params: {
  heading: string;
  contentHtml: string;
  siteUrl: string;
  unsubscribeUrl?: string;
}): string {
  const { heading, contentHtml, siteUrl, unsubscribeUrl } = params;
  const footer = unsubscribeUrl
    ? `<p style="margin:16px 0 0;font-size:12px;color:#8a96ad;">You are receiving this because you subscribed to the LucaPlus blog. <a href="${unsubscribeUrl}" style="color:#8a96ad;">Unsubscribe</a>.</p>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4faf9;font-family:Arial,Helvetica,sans-serif;color:#2b3a55;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf9;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:${NAVY};padding:20px 28px;">
            <span style="font-size:22px;font-weight:bold;letter-spacing:2px;color:#ffffff;">LUCA<span style="color:${TEAL};">PLUS</span></span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:${NAVY};">${escapeHtml(heading)}</h1>
            ${contentHtml}
            ${footer}
          </td></tr>
          <tr><td style="background:#f4faf9;padding:16px 28px;font-size:12px;color:#8a96ad;">
            <a href="${siteUrl}" style="color:${TEAL};">${siteUrl}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function confirmEmailContent(confirmUrl: string): string {
  return `<p style="font-size:15px;line-height:1.6;">Thanks for subscribing! Please confirm your email address to start receiving practical guides on invoicing, cashflow and small-business finance.</p>
  <p style="margin:24px 0;"><a href="${confirmUrl}" style="background:${GOLD};color:${NAVY};text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;display:inline-block;">Confirm subscription</a></p>
  <p style="font-size:13px;color:#8a96ad;">If you didn't request this, you can safely ignore this email.</p>`;
}

export function digestContent(posts: PostDTO[], siteUrl: string): string {
  const items = posts
    .map(
      (post) => `<tr><td style="padding:12px 0;border-bottom:1px solid #eef3f3;">
        <a href="${siteUrl}/blog/${post.slug}" style="font-size:16px;font-weight:bold;color:${NAVY};text-decoration:none;">${escapeHtml(post.title)}</a>
        <p style="margin:6px 0 0;font-size:14px;color:#5b6b86;">${escapeHtml(post.excerpt)}</p>
        <p style="margin:6px 0 0;font-size:12px;color:${TEAL};">${escapeHtml(post.categoryName)} · ${post.readingTimeMinutes} min read</p>
      </td></tr>`,
    )
    .join('');

  return `<p style="font-size:15px;line-height:1.6;">Here are the latest articles from the LucaPlus blog:</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>`;
}
