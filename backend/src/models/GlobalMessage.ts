import mongoose, { Document, Schema } from 'mongoose';

export interface IGlobalMessage extends Document {
  room: string;
  message: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  replyTo?: {
    id: string;
    username: string;
    message: string;
  } | null;
  createdAt: Date;
}

const GlobalMessageSchema: Schema = new Schema({
  room: { type: String, required: true },
  message: { type: String, required: true },
  user: {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String }
  },
  replyTo: {
    id: { type: String },
    username: { type: String },
    message: { type: String }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Automatically delete global messages after 24 hours (86400 seconds)
GlobalMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export default mongoose.model<IGlobalMessage>('GlobalMessage', GlobalMessageSchema);
