import { z } from 'zod';

/**
 * Centralised, validated environment access. Server-only — never import this
 * from a client component. Defaults keep `npm run dev` working out of the box;
 * real values come from .env.local.
 */

const raw = {
  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/lucaplus-blog',

  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY ?? '',
  NIM_BASE_URL: process.env.NIM_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
  NIM_MODEL: process.env.NIM_MODEL ?? 'meta/llama-3.3-70b-instruct',

  BLOG_GENERATION_ENABLED:
    (process.env.BLOG_GENERATION_ENABLED ?? 'true').toLowerCase() === 'true',
  CRON_SCHEDULE: process.env.CRON_SCHEDULE ?? '0 9 * * 1-5',
  BLOG_AUTOPUBLISH_MIN_SCORE: Number(process.env.BLOG_AUTOPUBLISH_MIN_SCORE ?? '70'),
  CRON_SECRET: process.env.CRON_SECRET ?? 'lucaplus-dev-cron-secret',

  ADMIN_EMAIL: (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'change-me',
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'lucaplus-dev-session-secret-change-me',

  SITE_URL: (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  SITE_NAME: process.env.SITE_NAME ?? 'LucaPlus Blog',

  SMTP_HOST: process.env.SMTP_HOST ?? '',
  SMTP_PORT: Number(process.env.SMTP_PORT ?? '587'),
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
  MAIL_FROM: process.env.MAIL_FROM ?? 'LucaPlus Blog <no-reply@lucaplus.com>',
  CAMPAIGN_SCHEDULE: process.env.CAMPAIGN_SCHEDULE ?? '*/15 * * * *',
};

const schema = z.object({
  MONGODB_URI: z.string().min(1),
  NVIDIA_API_KEY: z.string(),
  NIM_BASE_URL: z.string().min(1),
  NIM_MODEL: z.string().min(1),
  BLOG_GENERATION_ENABLED: z.boolean(),
  CRON_SCHEDULE: z.string().min(1),
  BLOG_AUTOPUBLISH_MIN_SCORE: z.number().int().min(0).max(100),
  CRON_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  SITE_URL: z.string().min(1),
  SITE_NAME: z.string().min(1),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.number().int(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  MAIL_FROM: z.string().min(1),
  CAMPAIGN_SCHEDULE: z.string().min(1),
});

export const env = schema.parse(raw);
export type Env = z.infer<typeof schema>;

/** True when a usable NVIDIA NIM key is present. */
export const isNimConfigured = (): boolean => env.NVIDIA_API_KEY.trim().length > 0;

/** True when SMTP is configured; otherwise email runs in dry-run mode. */
export const isEmailConfigured = (): boolean => env.SMTP_HOST.trim().length > 0;
