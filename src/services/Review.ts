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

const createReview = async (input: IReview) => {
    const review = new ReviewModel(input);
    return await review.save();
};

const getReview = async (reviewId: string) => {
    return await ReviewModel.findById(reviewId).exec();
};

const getAllReviews = async (pagination?: PaginationParams): Promise<ListResult<any>> => {
    if (!pagination) {
        return await ReviewModel.find().sort({ _id: 1 }).exec();
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([ReviewModel.find().sort({ _id: 1 }).skip(skip).limit(limit).exec(), ReviewModel.countDocuments()]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getReviewsByRoute = async (routeId: string) => {
    return await ReviewModel.find({ routeId }).sort({ _id: 1 }).exec();
};

const updateReview = async (reviewId: string, input: Partial<IReview>) => {
    return await ReviewModel.findByIdAndUpdate(reviewId, input, { new: true }).exec();
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
    updateReview,
    deleteReview,
    deleteReviewsByRoute
};
