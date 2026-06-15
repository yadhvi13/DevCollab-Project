import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  type: 'update' | 'achievement' | 'release' | 'blog';
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['update', 'achievement', 'release', 'blog'], default: 'update' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

// Automatically delete posts after 24 hours (86400 seconds)
PostSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export default mongoose.model<IPost>('Post', PostSchema);
