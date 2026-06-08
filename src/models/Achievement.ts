import mongoose, { Document, Schema } from 'mongoose';

export type AchievementCode = 'FIRST_ROUTE' | 'FIVE_ROUTES' | 'TEN_FAVORITES' | 'FIRST_FAVORITE';

export interface IAchievement {
    code: AchievementCode;
    title: string;
    description: string;
    icon: string;
}

export interface IAchievementModel extends IAchievement, Document {}

const AchievementSchema = new Schema(
    {
        code: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true }
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model<IAchievementModel>('Achievement', AchievementSchema);
