import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentSession } from '@/lib/auth/admin';
import {
  createCampaign,
  deleteCampaign,
  prepareAiCampaign,
  prepareDigest,
  sendCampaignNow,
} from '@/services/campaign-service';
import type { CampaignType, TargetProduct } from '@/types/blog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const action = (body.action as string) ?? 'create';

  try {
    if (action === 'send') {
      if (!body.id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
      const campaign = await sendCampaignNow(String(body.id));
      return NextResponse.json({ ok: true, campaign });
    }

    if (action === 'delete') {
      if (!body.id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
      await deleteCampaign(String(body.id));
      return NextResponse.json({ ok: true });
    }

    // action === 'create'
    const mode = ((body.mode as string) ?? 'manual') as CampaignType;
    const audience = body.audience === 'all' ? 'all' : 'confirmed';
    let subject = String(body.subject ?? '').trim();
    let bodyHtml = String(body.bodyHtml ?? '').trim();
    let relatedProduct: TargetProduct | undefined;

    if (mode === 'digest') {
      const digest = await prepareDigest(14);
      if (!digest) {
        return NextResponse.json(
          { error: 'No recent posts to include in a digest.' },
          { status: 400 },
        );
      }
      subject = subject || digest.subject;
      bodyHtml = digest.bodyHtml;
    } else if (mode === 'ai') {
      const product = (body.product === 'lucapay' ? 'lucapay' : 'lucaplus') as TargetProduct;
      relatedProduct = product;
      const draft = await prepareAiCampaign(product);
      subject = subject || draft.subject;
      bodyHtml = draft.bodyHtml;
    }

    if (!subject || !bodyHtml) {
      return NextResponse.json(
        { error: 'Subject and content are required.' },
        { status: 400 },
      );
    }

    const scheduledRaw = body.scheduledAt ? new Date(String(body.scheduledAt)) : null;
    const scheduledAt =
      scheduledRaw && !Number.isNaN(scheduledRaw.getTime()) ? scheduledRaw : null;

    const campaign = await createCampaign({
      subject,
      type: mode,
      bodyHtml,
      audience,
      scheduledAt,
      relatedProduct,
      createdBy: session.email,
    });

    if (body.sendNow && !scheduledAt) {
      const sent = await sendCampaignNow(campaign.id);
      return NextResponse.json({ ok: true, campaign: sent });
    }

    return NextResponse.json({ ok: true, campaign });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed.' },
      { status: 500 },
    );
  }
}
