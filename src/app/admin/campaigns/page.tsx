import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { CampaignActions } from '@/components/admin/campaign-actions';
import { CampaignForm } from '@/components/admin/campaign-form';
import { isEmailConfigured } from '@/config/env';
import { getCurrentSession } from '@/lib/auth/admin';
import { listCampaigns, type CampaignDTO } from '@/services/campaign-service';
import { subscriberCounts } from '@/services/subscriber-service';

export const dynamic = 'force-dynamic';

function fmt(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleString('en-AU', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

export default async function CampaignsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');

  let campaigns: CampaignDTO[] = [];
  let subs = { confirmed: 0, pending: 0, unsubscribed: 0, total: 0 };
  try {
    campaigns = await listCampaigns(50);
    subs = await subscriberCounts();
  } catch {
    // DB unavailable.
  }

  return (
    <AdminShell email={session.email} active="campaigns">
      <h1 className="font-heading text-2xl font-extrabold text-navy">Campaigns</h1>
      <p className="mt-1 text-sm text-muted">
        {subs.confirmed} confirmed subscriber{subs.confirmed === 1 ? '' : 's'} ·{' '}
        {subs.pending} pending
      </p>

      {!isEmailConfigured() ? (
        <div className="mt-4 rounded-lg border border-gold bg-gold/15 p-4 text-sm text-navy">
          <strong>SMTP not configured.</strong> Campaigns will be created and counted
          but emails run in <em>dry-run</em> mode (logged, not delivered). Add{' '}
          <code>SMTP_*</code> values to <code>.env.local</code> to send for real.
        </div>
      ) : null}

      <div className="mt-6">
        <CampaignForm />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-bold text-navy">All campaigns</h2>
        <div className="overflow-x-auto rounded-xl border border-surface-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Sent / Recipients</th>
                <th className="px-4 py-2">Scheduled</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No campaigns yet.</td></tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t border-surface-100 align-middle">
                    <td className="px-4 py-2 font-medium text-navy">{campaign.subject}</td>
                    <td className="px-4 py-2">{campaign.type}</td>
                    <td className="px-4 py-2">{campaign.status}</td>
                    <td className="px-4 py-2">
                      {campaign.sentCount} / {campaign.recipientCount}
                    </td>
                    <td className="px-4 py-2 text-muted">{fmt(campaign.scheduledAt)}</td>
                    <td className="px-4 py-2">
                      <CampaignActions id={campaign.id} status={campaign.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
