import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { env } from '@/config/env';
import { confirmEmailContent, wrapEmail } from '@/lib/email/templates';
import { sendMail } from '@/lib/email/mailer';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { subscribe } from '@/services/subscriber-service';

const schema = z.object({
  email: z
    .string()
    .max(200)
    .refine((value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), 'Invalid email'),
  source: z.string().max(40).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const limit = rateLimit(`subscribe:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  try {
    const result = await subscribe(parsed.data.email, parsed.data.source ?? 'footer');

    if (result.alreadyConfirmed) {
      return NextResponse.json({ message: "You're already subscribed — thanks!" });
    }

    if (result.confirmToken) {
      const confirmUrl = `${env.SITE_URL}/api/newsletter/confirm?token=${result.confirmToken}`;
      await sendMail({
        to: parsed.data.email,
        subject: 'Confirm your LucaPlus subscription',
        html: wrapEmail({
          heading: 'Confirm your subscription',
          contentHtml: confirmEmailContent(confirmUrl),
          siteUrl: env.SITE_URL,
        }),
      }).catch((error) =>
        logger.warn({ err: String(error) }, 'confirmation email failed'),
      );
    }

    return NextResponse.json({
      message: 'Thanks! Please check your inbox to confirm your subscription.',
    });
  } catch (error) {
    logger.error({ err: String(error) }, 'subscribe failed');
    return NextResponse.json(
      { error: 'Could not subscribe right now. Please try again.' },
      { status: 500 },
    );
  }
}
