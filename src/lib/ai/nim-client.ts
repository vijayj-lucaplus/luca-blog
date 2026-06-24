import OpenAI from 'openai';
import { env, isNimConfigured } from '@/config/env';
import { logger } from '@/lib/logger';

/**
 * NVIDIA NIM is OpenAI-compatible, so we use the official `openai` SDK pointed
 * at the NIM base URL. The API key stays server-side only.
 */
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface ChatResult {
  content: string;
  tokensIn: number;
  tokensOut: number;
}

const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 2;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!isNimConfigured()) {
    throw new Error(
      'NVIDIA_API_KEY is not configured. Add your nvapi- key to .env.local to enable AI generation.',
    );
  }
  if (!client) {
    client = new OpenAI({
      baseURL: env.NIM_BASE_URL,
      apiKey: env.NVIDIA_API_KEY,
    });
  }
  return client;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls NIM chat completions with a per-request timeout plus retry/backoff on
 * rate limits (429) and 5xx. A timeout is NOT retried — it throws immediately so
 * a slow run fails cleanly within the function budget instead of being
 * hard-killed by the host (which would orphan the job).
 */
export async function chat(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  } = {},
): Promise<ChatResult> {
  const model = options.model ?? env.NIM_MODEL;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const completion = await getClient().chat.completions.create(
        {
          model,
          messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          temperature: options.temperature ?? 0.6,
          top_p: 0.95,
          max_tokens: options.maxTokens ?? 2048,
        },
        { timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS },
      );

      const content = completion.choices[0]?.message?.content ?? '';
      return {
        content,
        tokensIn: completion.usage?.prompt_tokens ?? 0,
        tokensOut: completion.usage?.completion_tokens ?? 0,
      };
    } catch (error) {
      lastError = error;
      const status = (error as { status?: number }).status;
      const retryable =
        status === 429 || (typeof status === 'number' && status >= 500);
      if (!retryable || attempt === MAX_RETRIES) break;
      const backoff = 1000 * 2 ** attempt;
      logger.warn({ status, attempt, backoff }, 'NIM request failed; retrying');
      await sleep(backoff);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('NIM request failed after retries');
}
