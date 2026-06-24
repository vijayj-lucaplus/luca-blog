import { Schema, model, models, type Model } from 'mongoose';
import type { SubscriberStatus } from '@/types/blog';

export interface ISubscriber {
  email: string;
  status: SubscriberStatus;
  confirmToken?: string;
  confirmTokenExpiresAt?: Date;
  unsubscribeToken: string;
  source: string;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'unsubscribed'],
      default: 'pending',
      index: true,
    },
    confirmToken: { type: String },
    confirmTokenExpiresAt: { type: Date },
    unsubscribeToken: { type: String, required: true },
    source: { type: String, default: 'footer' },
    confirmedAt: { type: Date },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export const Subscriber: Model<ISubscriber> =
  (models.Subscriber as Model<ISubscriber>) ??
  model<ISubscriber>('Subscriber', subscriberSchema);
