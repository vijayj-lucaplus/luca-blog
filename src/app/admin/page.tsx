import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { GenerateButton } from '@/components/admin/generate-button';
import { PostActions } from '@/components/admin/post-actions';
import { isNimConfigured } from '@/config/env';
import { getCurrentSession } from '@/lib/auth/admin';
import {
  getDashboardStats,
  getRecentJobs,
  getRecentPosts,
  type AdminPostDTO,
  type DashboardStats,
  type JobDTO,
} from '@/services/admin-service';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-surface-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-navy">{value}</p>
      {sub ? <p className="text-xs text-muted">{sub}</p> : null}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  published: 'text-brand-dark',
  succeeded: 'text-brand-dark',
  draft: 'text-orange',
  failed: 'text-red-500',
  skipped: 'text-muted',
  running: 'text-navy',
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');

  let stats: DashboardStats | null = null;
  let jobs: JobDTO[] = [];
  let posts: AdminPostDTO[] = [];
  try {
    stats = await getDashboardStats();
    jobs = await getRecentJobs(8);
    posts = await getRecentPosts(8);
  } catch {
    // DB unavailable — render with empty data.
  }

  return (
    <AdminShell email={session.email} active="dashboard">
      {!isNimConfigured() ? (
        <div className="mb-6 rounded-lg border border-gold bg-gold/15 p-4 text-sm text-navy">
          <strong>NVIDIA NIM key not set.</strong> Add <code>NVIDIA_API_KEY</code> to
          <code> .env.local</code> to enable AI generation. Until then, generation is skipped.
        </div>
      ) : null}

      <h1 className="font-heading text-2xl font-extrabold text-navy">Dashboard</h1>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Published" value={stats?.posts.published ?? 0} sub={`${stats?.posts.draft ?? 0} drafts`} />
        <StatCard label="Drafts" value={stats?.posts.draft ?? 0} sub={`${stats?.posts.failed ?? 0} failed`} />
        <StatCard
          label="Last job"
          value={stats?.lastJob?.status ?? '—'}
          sub={stats?.lastJob ? fmt(stats.lastJob.createdAt) : 'no runs yet'}
        />
      </div>

      <div className="mt-6">
        <GenerateButton />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-bold text-navy">Recent generation jobs</h2>
        <div className="overflow-x-auto rounded-xl border border-surface-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Topic</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No jobs yet.</td></tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-surface-100">
                    <td className="px-4 py-2 text-muted">{fmt(job.createdAt)}</td>
                    <td className="px-4 py-2">{job.categorySlug}</td>
                    <td className="px-4 py-2">
                      {job.postSlug ? (
                        <Link href={`/blog/${job.postSlug}`} className="text-brand-dark hover:underline">
                          {job.topicTitle ?? job.postSlug}
                        </Link>
                      ) : (
                        job.topicTitle ?? '—'
                      )}
                    </td>
                    <td className={`px-4 py-2 font-semibold ${STATUS_COLORS[job.status] ?? 'text-navy'}`}>
                      {job.status}
                    </td>
                    <td className="px-4 py-2">{job.qualityScore ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-bold text-navy">Recent posts</h2>
        <div className="overflow-x-auto rounded-xl border border-surface-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Views</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No posts yet.</td></tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-t border-surface-100 align-middle">
                    <td className="px-4 py-2">
                      {post.status === 'published' ? (
                        <Link href={`/blog/${post.slug}`} className="text-brand-dark hover:underline">
                          {post.title}
                        </Link>
                      ) : (
                        post.title
                      )}
                    </td>
                    <td className="px-4 py-2">{post.categoryName}</td>
                    <td className={`px-4 py-2 font-semibold ${STATUS_COLORS[post.status] ?? 'text-navy'}`}>
                      {post.status}
                    </td>
                    <td className="px-4 py-2">{post.views}</td>
                    <td className="px-4 py-2">{post.qualityScore}</td>
                    <td className="px-4 py-2"><PostActions id={post.id} /></td>
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
