import nodemailer, { type Transporter } from 'nodemailer';
import { env, isEmailConfigured } from '@/config/env';
import { logger } from '@/lib/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

/**
 * Sends an email. When SMTP is not configured the call is a logged no-op
 * (dry-run) so the rest of the app keeps working in local development.
 */
export async function sendMail(
  message: MailMessage,
): Promise<{ sent: boolean; dryRun: boolean }> {
  if (!isEmailConfigured()) {
    logger.info(
      { to: message.to, subject: message.subject },
      '[dry-run] email not sent (SMTP not configured)',
    );
    return { sent: false, dryRun: true };
  }

  await getTransporter().sendMail({
    from: env.MAIL_FROM,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    headers: message.headers,
  });
  return { sent: true, dryRun: false };
}
