import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAchievement {
    userId: string;
    achievementCode: string;
    unlockedAt: Date;
}

export interface IUserAchievementModel extends IUserAchievement, Document {}

const UserAchievementSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        achievementCode: { type: String, ref: 'Achievement', required: true },
        unlockedAt: { type: Date, default: Date.now }
    },
    { timestamps: true, versionKey: false }
);

UserAchievementSchema.index({ userId: 1, achievementCode: 1 }, { unique: true });

export default mongoose.model<IUserAchievementModel>('UserAchievement', UserAchievementSchema);
