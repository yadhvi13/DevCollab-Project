import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: 'CREATE_REPO' | 'COMMIT';
  repoId: mongoose.Types.ObjectId;
  repoName: string;
  timestamp: Date;
  metadata?: any;
}

const ActivitySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['CREATE_REPO', 'COMMIT'], required: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  repoName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  metadata: { type: Schema.Types.Mixed },
});

// Index to quickly fetch activities by user and year
ActivitySchema.index({ user: 1, timestamp: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
