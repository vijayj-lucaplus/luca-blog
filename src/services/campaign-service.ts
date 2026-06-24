import { PRODUCTS } from '@/config/constants';
import { env, isNimConfigured } from '@/config/env';
import { chat } from '@/lib/ai/nim-client';
import { parseLenientJson } from '@/lib/ai/parse-json';
import { connectToDatabase } from '@/lib/db/mongoose';
import { sendMail } from '@/lib/email/mailer';
import { digestContent, wrapEmail } from '@/lib/email/templates';
import { logger } from '@/lib/logger';
import { Campaign, type ICampaign } from '@/models/campaign';
import { getPostsSince } from '@/services/post-service';
import { getRecipients } from '@/services/subscriber-service';
import type { CampaignType, TargetProduct } from '@/types/blog';

type LeanCampaign = ICampaign & { _id: unknown };

export interface CampaignDTO {
  id: string;
  subject: string;
  type: CampaignType;
  status: ICampaign['status'];
  audience: 'all' | 'confirmed';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  relatedProduct?: TargetProduct;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDTO(doc: LeanCampaign): CampaignDTO {
  return {
    id: String(doc._id),
    subject: doc.subject,
    type: doc.type,
    status: doc.status,
    audience: doc.audience,
    recipientCount: doc.recipientCount,
    sentCount: doc.sentCount,
    failedCount: doc.failedCount,
    relatedProduct: doc.relatedProduct,
    scheduledAt: doc.scheduledAt ? new Date(doc.scheduledAt).toISOString() : null,
    sentAt: doc.sentAt ? new Date(doc.sentAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export interface CreateCampaignInput {
  subject: string;
  type: CampaignType;
  bodyHtml: string;
  audience: 'all' | 'confirmed';
  scheduledAt?: Date | null;
  relatedProduct?: TargetProduct;
  createdBy?: string;
}

export async function createCampaign(input: CreateCampaignInput): Promise<CampaignDTO> {
  await connectToDatabase();
  const doc = await Campaign.create({
    subject: input.subject,
    type: input.type,
    bodyHtml: input.bodyHtml,
    audience: input.audience,
    scheduledAt: input.scheduledAt ?? null,
    relatedProduct: input.relatedProduct,
    createdBy: input.createdBy ?? 'admin',
    status: input.scheduledAt ? 'scheduled' : 'draft',
  });
  return toDTO(doc.toObject() as LeanCampaign);
}

export async function listCampaigns(limit = 50): Promise<CampaignDTO[]> {
  await connectToDatabase();
  const docs = await Campaign.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanCampaign[]>();
  return docs.map(toDTO);
}

export async function getCampaignById(id: string): Promise<CampaignDTO | null> {
  await connectToDatabase();
  const doc = await Campaign.findById(id).lean<LeanCampaign>();
  return doc ? toDTO(doc) : null;
}

export async function deleteCampaign(id: string): Promise<void> {
  await connectToDatabase();
  await Campaign.deleteOne({ _id: id });
}

/** Builds inner HTML for a digest of posts published in the last `days`. */
export async function prepareDigest(
  days = 14,
): Promise<{ subject: string; bodyHtml: string } | null> {
  const posts = await getPostsSince(days);
  if (posts.length === 0) return null;
  return {
    subject: `LucaPlus blog: ${posts.length} new article${posts.length > 1 ? 's' : ''} this fortnight`,
    bodyHtml: digestContent(posts, env.SITE_URL),
  };
}

function extractCampaignJson(raw: string): { subject?: string; bodyHtml?: string } {
  try {
    return parseLenientJson(raw) as { subject?: string; bodyHtml?: string };
  } catch {
    return {};
  }
}

/** Drafts a promotional campaign for a product using NIM. */
export async function prepareAiCampaign(
  product: TargetProduct,
): Promise<{ subject: string; bodyHtml: string }> {
  if (!isNimConfigured()) {
    throw new Error('NVIDIA_API_KEY not configured; cannot draft an AI campaign.');
  }
  const target = product === 'lucapay' ? PRODUCTS.lucapay : PRODUCTS.lucaplus;
  const result = await chat(
    [
      {
        role: 'system',
        content:
          'You write concise, friendly marketing newsletter emails for a fintech brand. Output ONLY JSON {"subject": string, "bodyHtml": string}. bodyHtml must be simple inline-free HTML using only <p>, <ul>, <li>, <strong> and a single <a> CTA, 120-200 words, no invented statistics, and exactly one link to the given product URL.',
      },
      {
        role: 'user',
        content: `Write a newsletter promoting ${target.name}. Value proposition: ${target.blurb}. CTA link URL: ${target.url}.`,
      },
    ],
    { temperature: 0.7, maxTokens: 900 },
  );

  const parsed = extractCampaignJson(result.content);
  if (!parsed.subject || !parsed.bodyHtml) {
    throw new Error('AI campaign draft could not be parsed.');
  }
  return { subject: parsed.subject, bodyHtml: parsed.bodyHtml };
}

async function deliver(
  campaign: Pick<ICampaign, 'subject' | 'bodyHtml' | 'audience'>,
): Promise<{ sent: number; failed: number; recipients: number }> {
  const recipients = await getRecipients(campaign.audience);
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const unsubscribeUrl = `${env.SITE_URL}/api/newsletter/unsubscribe?token=${recipient.unsubscribeToken}`;
    const html = wrapEmail({
      heading: campaign.subject,
      contentHtml: campaign.bodyHtml,
      siteUrl: env.SITE_URL,
      unsubscribeUrl,
    });
    try {
      await sendMail({
        to: recipient.email,
        subject: campaign.subject,
        html,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      logger.warn({ to: recipient.email, err: String(error) }, 'Campaign send failed');
    }
  }

  return { sent, failed, recipients: recipients.length };
}

export async function sendCampaignNow(id: string): Promise<CampaignDTO> {
  await connectToDatabase();
  const campaign = await Campaign.findById(id);
  if (!campaign) throw new Error('Campaign not found');
  if (campaign.status === 'sent') return toDTO(campaign.toObject() as LeanCampaign);

  campaign.status = 'sending';
  await campaign.save();

  try {
    const { sent, failed, recipients } = await deliver(campaign);
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.recipientCount = recipients;
    campaign.sentCount = sent;
    campaign.failedCount = failed;
    await campaign.save();
    logger.info({ id, sent, failed, recipients }, 'Campaign sent');
  } catch (error) {
    campaign.status = 'failed';
    campaign.error = error instanceof Error ? error.message : String(error);
    await campaign.save();
    throw error;
  }

  return toDTO(campaign.toObject() as LeanCampaign);
}

/** Sends any scheduled campaigns whose time has arrived. Called by the scheduler. */
export async function processDueCampaigns(): Promise<number> {
  await connectToDatabase();
  const due = await Campaign.find({
    status: 'scheduled',
    scheduledAt: { $lte: new Date() },
  }).lean<LeanCampaign[]>();

  for (const campaign of due) {
    await sendCampaignNow(String(campaign._id)).catch((error) => {
      logger.error({ id: String(campaign._id), err: String(error) }, 'Scheduled campaign failed');
    });
  }
  return due.length;
}

export async function campaignCounts(): Promise<{ total: number; sent: number; scheduled: number }> {
  await connectToDatabase();
  const [total, sent, scheduled] = await Promise.all([
    Campaign.countDocuments({}),
    Campaign.countDocuments({ status: 'sent' }),
    Campaign.countDocuments({ status: 'scheduled' }),
  ]);
  return { total, sent, scheduled };
}
