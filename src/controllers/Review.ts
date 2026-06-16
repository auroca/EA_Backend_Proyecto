import { NextFunction, Request, Response } from 'express';
import ReviewService from '../services/Review';
import { parsePagination } from '../library/Pagination';
import { AuthRequest } from '../middleware/auth';

const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id ?? req.body.userId;

        if (!userId) {
            return res.status(422).json({ message: 'userId is required' });
        }

        const savedReview = await ReviewService.createReview({
            ...req.body,
            userId
        });

        return res.status(201).json(savedReview);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readReview = async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.reviewId;

    try {
        const review = await ReviewService.getReview(reviewId);
        return review ? res.status(200).json(review) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);
        const routeId = req.query.routeId as string | undefined;

        if (routeId) {
            const reviews = await ReviewService.getReviewsByRoute(routeId);
            return res.status(200).json(reviews);
        }

        const reviews = await ReviewService.getAllReviews(pagination);
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateReview = async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.reviewId;

    try {
        const data = { ...req.body };
        delete data.userId;

        const updatedReview = await ReviewService.updateReview(reviewId, data);
        return updatedReview ? res.status(200).json(updatedReview) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.reviewId;

    try {
        const review = await ReviewService.deleteReview(reviewId);
        return review ? res.status(200).json(review) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createReview,
    readReview,
    readAll,
    updateReview,
    deleteReview
};
