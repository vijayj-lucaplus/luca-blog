import { connectToDatabase } from '@/lib/db/mongoose';
import { GenerationJob, type IGenerationJob } from '@/models/generation-job';
import { Post, type IPost } from '@/models/post';
import { campaignCounts } from '@/services/campaign-service';
import { subscriberCounts } from '@/services/subscriber-service';

type LeanJob = IGenerationJob & { _id: unknown };
type LeanPostDoc = IPost & { _id: unknown };

export interface JobDTO {
  id: string;
  status: string;
  categorySlug: string;
  topicTitle?: string;
  postSlug?: string;
  qualityScore?: number;
  createdAt: string;
  durationMs?: number;
  error?: string;
}

export interface AdminPostDTO {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryName: string;
  qualityScore: number;
  views: number;
  publishedAt: string | null;
  createdAt: string;
}

function toJob(doc: LeanJob): JobDTO {
  return {
    id: String(doc._id),
    status: doc.status,
    categorySlug: doc.categorySlug,
    topicTitle: doc.topicTitle,
    postSlug: doc.postSlug,
    qualityScore: doc.qualityScore,
    createdAt: new Date(doc.createdAt).toISOString(),
    durationMs: doc.durationMs,
    error: doc.error,
  };
}

function toAdminPost(doc: LeanPostDoc): AdminPostDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    status: doc.status,
    categoryName: doc.categoryName,
    qualityScore: doc.qualityScore,
    views: doc.views ?? 0,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export interface DashboardStats {
  posts: { published: number; draft: number; failed: number };
  subscribers: { confirmed: number; pending: number; unsubscribed: number; total: number };
  campaigns: { total: number; sent: number; scheduled: number };
  lastJob: JobDTO | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();
  const [published, draft, failed] = await Promise.all([
    Post.countDocuments({ status: 'published' }),
    Post.countDocuments({ status: 'draft' }),
    Post.countDocuments({ status: 'failed' }),
  ]);
  const [subscribers, campaigns, lastJobDoc] = await Promise.all([
    subscriberCounts(),
    campaignCounts(),
    GenerationJob.findOne({}).sort({ createdAt: -1 }).lean<LeanJob>(),
  ]);

  return {
    posts: { published, draft, failed },
    subscribers,
    campaigns,
    lastJob: lastJobDoc ? toJob(lastJobDoc) : null,
  };
}

export async function getRecentJobs(limit = 10): Promise<JobDTO[]> {
  await connectToDatabase();
  const docs = await GenerationJob.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanJob[]>();
  return docs.map(toJob);
}

export async function getRecentPosts(limit = 10): Promise<AdminPostDTO[]> {
  await connectToDatabase();
  const docs = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanPostDoc[]>();
  return docs.map(toAdminPost);
}
