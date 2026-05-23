import { NextFunction, Request, Response } from 'express';
import HistoryService from '../services/History';
import { parsePagination } from '../library/Pagination';
import { isValidObjectId, sendServiceError } from '../utils/controllerResponses';

const createHistory = async (req: Request, res: Response, next: NextFunction) => {
    const result = await HistoryService.createHistory(req.body);

    if (result.success) {
        return res.status(201).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readAllHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);
        const result = await HistoryService.getAllHistory(pagination);

        if (result.success) {
            return res.status(200).json(result.data);
        }

        return sendServiceError(res, result.error, result.statusCode);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

const readHistory = async (req: Request, res: Response, next: NextFunction) => {
    const historyId = req.params.historyId;

    if (!isValidObjectId(historyId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await HistoryService.getHistory(historyId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const updateHistory = async (req: Request, res: Response, next: NextFunction) => {
    const historyId = req.params.historyId;

    if (!isValidObjectId(historyId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await HistoryService.updateHistory(historyId, req.body);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const deleteHistory = async (req: Request, res: Response, next: NextFunction) => {
    const historyId = req.params.historyId;

    if (!isValidObjectId(historyId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await HistoryService.deleteHistory(historyId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

export default {
    createHistory,
    readAllHistory,
    readHistory,
    updateHistory,
    deleteHistory
};
