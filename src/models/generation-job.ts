import { Schema, model, models, type Model } from 'mongoose';
import type {
  CategorySlug,
  GenerationJobStatus,
  GenerationTrigger,
  QualityCheck,
} from '@/types/blog';

export interface IGenerationJob {
  runKey: string;
  status: GenerationJobStatus;
  trigger: GenerationTrigger;
  categorySlug: CategorySlug;
  focusKeyword?: string;
  topicTitle?: string;
  model: string;
  postId?: string;
  postSlug?: string;
  qualityScore?: number;
  validationPassed?: boolean;
  validationChecks: QualityCheck[];
  tokensIn: number;
  tokensOut: number;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const checkSchema = new Schema<QualityCheck>(
  {
    name: { type: String, required: true },
    passed: { type: Boolean, required: true },
    detail: { type: String },
  },
  { _id: false },
);

const generationJobSchema = new Schema<IGenerationJob>(
  {
    runKey: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'succeeded', 'failed', 'skipped'],
      default: 'queued',
      index: true,
    },
    trigger: { type: String, enum: ['cron', 'manual'], default: 'cron' },
    categorySlug: { type: String, required: true },
    focusKeyword: { type: String },
    topicTitle: { type: String },
    model: { type: String, default: '' },
    postId: { type: String },
    postSlug: { type: String },
    qualityScore: { type: Number },
    validationPassed: { type: Boolean },
    validationChecks: { type: [checkSchema], default: [] },
    tokensIn: { type: Number, default: 0 },
    tokensOut: { type: Number, default: 0 },
    error: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    durationMs: { type: Number },
  },
  { timestamps: true },
);

export const GenerationJob: Model<IGenerationJob> =
  (models.GenerationJob as Model<IGenerationJob>) ??
  model<IGenerationJob>('GenerationJob', generationJobSchema);
