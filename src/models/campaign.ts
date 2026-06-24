import { Schema, model, models, type Model } from 'mongoose';
import type { CampaignStatus, CampaignType, TargetProduct } from '@/types/blog';

export interface ICampaign {
  subject: string;
  type: CampaignType;
  bodyHtml: string;
  bodyText: string;
  status: CampaignStatus;
  audience: 'all' | 'confirmed';
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  relatedProduct?: TargetProduct;
  createdBy: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    subject: { type: String, required: true, trim: true },
    type: { type: String, enum: ['manual', 'digest', 'ai'], default: 'manual' },
    bodyHtml: { type: String, required: true },
    bodyText: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
      default: 'draft',
      index: true,
    },
    audience: { type: String, enum: ['all', 'confirmed'], default: 'confirmed' },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    relatedProduct: { type: String, enum: ['lucaplus', 'lucapay', 'both'] },
    createdBy: { type: String, default: 'admin' },
    error: { type: String },
  },
  { timestamps: true },
);

campaignSchema.index({ status: 1, scheduledAt: 1 });

export const Campaign: Model<ICampaign> =
  (models.Campaign as Model<ICampaign>) ??
  model<ICampaign>('Campaign', campaignSchema);
