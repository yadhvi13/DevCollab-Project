import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  avatar: string;
  
  // Gamification
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  
  // Profile
  bio: string;
  skills: string[];
  techStack: string[];
  openToWork: boolean;
  portfolioLinks: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }],
  
  bio: { type: String, default: 'Software Developer' },
  skills: [{ type: String }],
  techStack: [{ type: String }],
  openToWork: { type: Boolean, default: false },
  portfolioLinks: [{ type: String }],
  
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
