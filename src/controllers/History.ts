import { NextFunction, Request, Response } from 'express';
import HistoryService from '../services/History';
import { parsePagination } from '../library/Pagination';

const createHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const history = await HistoryService.createHistory(req.body);

        if (!history) {
            return res.status(400).json({ message: 'Invalid history data' });
        }

        return res.status(201).json(history);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);
        const history = await HistoryService.getAllHistory(pagination);
        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readHistory = async (req: Request, res: Response, next: NextFunction) => {
    const historyId = req.params.historyId;

    try {
        const history = await HistoryService.getHistory(historyId);
        return history
            ? res.status(200).json(history)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateHistory = async (req: Request, res: Response, next: NextFunction) => {
    const historyId = req.params.historyId;

    try {
        const history = await HistoryService.updateHistory(historyId, req.body);
        return history
            ? res.status(200).json(history)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteHistory = async (req: Request, res: Response, next: NextFunction) => {
    const historyId = req.params.historyId;

    try {
        const history = await HistoryService.deleteHistory(historyId);
        return history
            ? res.status(200).json(history)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createHistory,
    readAllHistory,
    readHistory,
    updateHistory,
    deleteHistory
};