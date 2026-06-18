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
    averageRating?: number;
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
        ],
        averageRating: { type: Number, required: true, default: 0, min: 0, max: 5 }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false
    }
);

const calculateAverageRating = (ratings: IReview['ratings']): number => {
    if (!Array.isArray(ratings) || ratings.length === 0) {
        return 0;
    }

    const validScores = ratings.map((rating) => rating.score).filter((score) => typeof score === 'number' && Number.isFinite(score));

    if (validScores.length === 0) {
        return 0;
    }

    const total = validScores.reduce((sum, score) => sum + score, 0);
    return Number((total / validScores.length).toFixed(2));
};

ReviewSchema.pre('validate', function (next) {
    this.averageRating = calculateAverageRating(this.ratings);
    next();
});

ReviewSchema.index({ userId: 1, routeId: 1 }, { unique: true });

export default mongoose.model<IReviewModel>('Review', ReviewSchema);
