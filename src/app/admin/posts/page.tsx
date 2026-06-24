import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { PostActions } from '@/components/admin/post-actions';
import { getCurrentSession } from '@/lib/auth/admin';
import { getRecentPosts, type AdminPostDTO } from '@/services/admin-service';

export const dynamic = 'force-dynamic';

const STATUS_COLORS: Record<string, string> = {
  published: 'text-brand-dark',
  draft: 'text-orange',
  failed: 'text-red-500',
  archived: 'text-muted',
};

export default async function AdminPostsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');

  let posts: AdminPostDTO[] = [];
  try {
    posts = await getRecentPosts(50);
  } catch {
    posts = [];
  }

  return (
    <AdminShell email={session.email} active="posts">
      <h1 className="font-heading text-2xl font-extrabold text-navy">Posts</h1>
      <p className="mt-1 text-sm text-muted">
        Newest first. Deleting a draft frees its topic so it can be regenerated.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-100 bg-white">
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
                  <td className="px-4 py-2 font-medium text-navy">
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
                  <td className="px-4 py-2">
                    <PostActions id={post.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
