import { NextFunction, Request, Response } from 'express';
import ChangeService from '../services/Change';
import { isValidObjectId, sendServiceError } from '../utils/controllerResponses';

const createChange = async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChangeService.createChange(req.body);

    if (result.success) {
        return res.status(201).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readAllChanges = async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChangeService.getAllChanges();

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readChange = async (req: Request, res: Response, next: NextFunction) => {
    const changeId = req.params.changeId;

    if (!isValidObjectId(changeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await ChangeService.getChange(changeId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const updateChange = async (req: Request, res: Response, next: NextFunction) => {
    const changeId = req.params.changeId;

    if (!isValidObjectId(changeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await ChangeService.updateChange(changeId, req.body);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const deleteChange = async (req: Request, res: Response, next: NextFunction) => {
    const changeId = req.params.changeId;

    if (!isValidObjectId(changeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await ChangeService.deleteChange(changeId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

export default {
    createChange,
    readAllChanges,
    readChange,
    updateChange,
    deleteChange
};
