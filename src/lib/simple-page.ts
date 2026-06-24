import { env } from '@/config/env';
import { escapeHtml } from '@/lib/text';

/** Minimal branded HTML response for email link landings (confirm/unsubscribe). */
export function simplePage(title: string, message: string, ok = true): Response {
  const accent = ok ? '#1cbd99' : '#f3b03a';
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4faf9;color:#203060;display:flex;min-height:100vh;align-items:center;justify-content:center;">
    <div style="max-width:480px;background:#ffffff;border-radius:12px;padding:40px;text-align:center;box-shadow:0 10px 30px rgba(32,48,96,0.08);">
      <div style="font-size:26px;font-weight:bold;letter-spacing:2px;">LUCA<span style="color:#1cbd99;">PLUS</span></div>
      <h1 style="color:${accent};font-size:22px;margin:20px 0 8px;">${escapeHtml(title)}</h1>
      <p style="color:#5b6b86;font-size:15px;line-height:1.6;">${escapeHtml(message)}</p>
      <a href="${env.SITE_URL}" style="display:inline-block;margin-top:20px;background:#1cbd99;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;">Back to the blog</a>
    </div>
  </body>
</html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
