import mongoose, { Document, Schema } from 'mongoose';

export interface ICTA {
  label: string;
  url: string;
}

export interface IAdvertisement extends Document {
  type: 'horizontal' | 'vertical';
  position: number; // Order position (1, 2 for horizontal; 1, 2, 3 for vertical)
  badgeTitle?: string;
  title: string;
  discountText?: string;
  bannerImage: string;
  cta?: ICTA;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CTASchema = new Schema<ICTA>({
  label: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const AdvertisementSchema = new Schema<IAdvertisement>({
  type: {
    type: String,
    enum: ['horizontal', 'vertical'],
    required: true,
    index: true
  },
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  badgeTitle: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  discountText: {
    type: String,
    trim: true
  },
  bannerImage: {
    type: String,
    required: true
  },
  cta: {
    type: CTASchema,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
AdvertisementSchema.index({ type: 1, position: 1 });
AdvertisementSchema.index({ type: 1, isActive: 1 });

// Validation: Horizontal ads can only have positions 1-2
AdvertisementSchema.pre('save', function(next) {
  if (this.type === 'horizontal' && this.position > 2) {
    next(new Error('Horizontal advertisements can only have positions 1 or 2'));
  } else if (this.type === 'vertical' && this.position > 3) {
    next(new Error('Vertical advertisements can only have positions 1, 2, or 3'));
  } else {
    next();
  }
});

export default mongoose.models.Advertisement || mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
