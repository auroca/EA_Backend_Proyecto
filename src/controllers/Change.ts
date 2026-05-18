import { NextFunction, Request, Response } from 'express';
import ChangeService from '../services/Change';

const createChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const change = await ChangeService.createChange(req.body);

        if (!change) {
            return res.status(400).json({ message: 'Invalid change data' });
        }

        return res.status(201).json(change);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAllChanges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const changes = await ChangeService.getAllChanges();
        return res.status(200).json(changes);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readChange = async (req: Request, res: Response, next: NextFunction) => {
    const changeId = req.params.changeId;

    try {
        const change = await ChangeService.getChange(changeId);
        return change
            ? res.status(200).json(change)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateChange = async (req: Request, res: Response, next: NextFunction) => {
    const changeId = req.params.changeId;

    try {
        const change = await ChangeService.updateChange(changeId, req.body);
        return change
            ? res.status(200).json(change)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteChange = async (req: Request, res: Response, next: NextFunction) => {
    const changeId = req.params.changeId;

    try {
        const change = await ChangeService.deleteChange(changeId);
        return change
            ? res.status(200).json(change)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createChange,
    readAllChanges,
    readChange,
    updateChange,
    deleteChange
};