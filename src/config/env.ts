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
  // Fast free model so a single generate call finishes well inside the
  // serverless function time limit. Override with NIM_MODEL if you want to
  // trade speed for a larger model.
  NIM_MODEL: process.env.NIM_MODEL ?? 'meta/llama-3.1-8b-instruct',

  BLOG_GENERATION_ENABLED:
    (process.env.BLOG_GENERATION_ENABLED ?? 'true').toLowerCase() === 'true',
  BLOG_AUTOPUBLISH_MIN_SCORE: Number(process.env.BLOG_AUTOPUBLISH_MIN_SCORE ?? '70'),

  ADMIN_EMAIL: (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'change-me',
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'lucaplus-dev-session-secret-change-me',

  SITE_URL: (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  SITE_NAME: process.env.SITE_NAME ?? 'LucaPlus Blog',
};

const schema = z.object({
  MONGODB_URI: z.string().min(1),
  NVIDIA_API_KEY: z.string(),
  NIM_BASE_URL: z.string().min(1),
  NIM_MODEL: z.string().min(1),
  BLOG_GENERATION_ENABLED: z.boolean(),
  BLOG_AUTOPUBLISH_MIN_SCORE: z.number().int().min(0).max(100),
  ADMIN_EMAIL: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  SITE_URL: z.string().min(1),
  SITE_NAME: z.string().min(1),
});

export const env = schema.parse(raw);
export type Env = z.infer<typeof schema>;

/** True when a usable NVIDIA NIM key is present. */
export const isNimConfigured = (): boolean => env.NVIDIA_API_KEY.trim().length > 0;
