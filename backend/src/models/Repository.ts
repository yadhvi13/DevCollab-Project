import mongoose, { Document, Schema } from 'mongoose';

export interface IFile {
  path: string;
  content: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

export interface ICommit {
  sha: string;
  filePatches: { path: string; content: string }[];
  author: string;
  message: string;
  timestamp: Date;
}

export interface IKanbanTask {
  id: string;
  column: 'todo' | 'in-progress' | 'done';
  title: string;
  desc: string;
  author: string;
}

export interface IRepository extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  stars: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  parentRepo?: mongoose.Types.ObjectId;
  files: IFile[];
  commits: ICommit[];
  kanban: IKanbanTask[];
  discussions: { _id?: string; author: string; content: string; timestamp: Date }[];
}

const FileSchema = new Schema({
  path: { type: String, required: true },
  content: { type: String, default: '' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const CommitSchema = new Schema({
  sha: { type: String, required: true },
  filePatches: [{ path: String, content: String }],
  author: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const KanbanTaskSchema = new Schema({
  id: { type: String, required: true },
  column: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  author: { type: String, required: true },
}, { _id: false });

const DiscussionSchema = new Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: true });

const RepositorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  stars: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  parentRepo: { type: Schema.Types.ObjectId, ref: 'Repository' },
  files: [FileSchema],
  commits: [CommitSchema],
  kanban: [KanbanTaskSchema],
  discussions: [DiscussionSchema],
}, {
  timestamps: true,
});

// Ensure uniqueness of repo name per owner
RepositorySchema.index({ owner: 1, name: 1 }, { unique: true });

export default mongoose.model<IRepository>('Repository', RepositorySchema);
