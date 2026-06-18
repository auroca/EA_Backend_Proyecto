import ReviewModel, { IReview } from '../models/Review';
import { PaginationParams } from '../library/Pagination';

type PaginatedResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

type ListResult<T> = PaginatedResult<T> | T[];

export class DuplicateRouteReviewError extends Error {
    constructor() {
        super('You have already reviewed this route.');
        this.name = 'DuplicateRouteReviewError';
    }
}

const isDuplicateKeyError = (error: unknown): boolean => {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000;
};

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

const ensureAverageRating = async (review: any) => {
    if (!review) {
        return review;
    }

    const averageRating = calculateAverageRating(review.ratings);

    if (review.averageRating === averageRating) {
        return review;
    }

    review.averageRating = averageRating;

    if (typeof review.save === 'function') {
        await review.save();
    }

    return review;
};

const ensureAverageRatings = async <T extends any[] | PaginatedResult<any>>(result: T): Promise<T> => {
    if (Array.isArray(result)) {
        return (await Promise.all(result.map((review) => ensureAverageRating(review)))) as T;
    }

    return {
        ...result,
        data: await Promise.all(result.data.map((review) => ensureAverageRating(review)))
    } as T;
};

const createReview = async (input: IReview) => {
    const existingReview = await ReviewModel.findOne({
        userId: input.userId,
        routeId: input.routeId
    }).exec();

    if (existingReview) {
        throw new DuplicateRouteReviewError();
    }

    try {
        const review = new ReviewModel(input);
        return await review.save();
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new DuplicateRouteReviewError();
        }

        throw error;
    }
};

const getReview = async (reviewId: string) => {
    return await ensureAverageRating(await ReviewModel.findById(reviewId).exec());
};

const getAllReviews = async (pagination?: PaginationParams): Promise<ListResult<any>> => {
    if (!pagination) {
        return await ensureAverageRatings(await ReviewModel.find().sort({ _id: 1 }).exec());
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([ReviewModel.find().sort({ _id: 1 }).skip(skip).limit(limit).exec(), ReviewModel.countDocuments()]);

    return await ensureAverageRatings({
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
};

const getReviewsByRoute = async (routeId: string) => {
    return await ensureAverageRatings(await ReviewModel.find({ routeId }).sort({ _id: 1 }).exec());
};

const getReviewsByUser = async (userId: string) => {
    return await ensureAverageRatings(await ReviewModel.find({ userId }).sort({ _id: 1 }).exec());
};

const updateReview = async (reviewId: string, input: Partial<IReview>) => {
    const update = { ...input };

    if (update.ratings) {
        update.averageRating = calculateAverageRating(update.ratings);
    }

    return await ReviewModel.findByIdAndUpdate(reviewId, update, { new: true, runValidators: true }).exec();
};

const deleteReview = async (reviewId: string) => {
    return await ReviewModel.findByIdAndDelete(reviewId).exec();
};

const deleteReviewsByRoute = async (routeId: string) => {
    return await ReviewModel.deleteMany({ routeId }).exec();
};

export default {
    createReview,
    getReview,
    getAllReviews,
    getReviewsByRoute,
    getReviewsByUser,
    updateReview,
    deleteReview,
    deleteReviewsByRoute
};
