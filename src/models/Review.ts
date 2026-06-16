import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
    userId: string;
    routeId: string;
    title: string;
    comment?: string;
    ratings: {
        label: string;
        score: number;
    }[];
}

export interface IReviewModel extends IReview, Document {}

const ReviewSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
        title: { type: String, required: true },
        comment: { type: String },
        ratings: [
            {
                label: { type: String, required: true },
                score: { type: Number, required: true, min: 0, max: 5 }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

export default mongoose.model<IReviewModel>('Review', ReviewSchema);
