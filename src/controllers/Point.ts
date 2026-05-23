import { NextFunction, Request, Response } from 'express';
import PointService from '../services/Point';
import { parsePagination } from '../library/Pagination';
import Filters, { FieldSpec } from '../library/Filters';
import { isValidObjectId, sendServiceError } from '../utils/controllerResponses';

const createPoint = async (req: Request, res: Response, next: NextFunction) => {
    const result = await PointService.createPoint(req.body);

    if (result.success) {
        return res.status(201).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readPoint = async (req: Request, res: Response, next: NextFunction) => {
    const pointId = req.params.pointId;

    if (!isValidObjectId(pointId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await PointService.getPoint(pointId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);

        const allowedFields: FieldSpec[] = [
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'latitude', type: 'number' },
            { name: 'longitude', type: 'number' },
            { name: 'routeId', type: 'id' },
            { name: 'index', type: 'number' }
        ];

        const sourceFilter = (req.query.filter as any) || {};
        const { filter, errors } = Filters.parseFilters(sourceFilter, allowedFields);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const result = await PointService.getAllPoints(pagination, filter);

        if (result.success) {
            return res.status(200).json(result.data);
        }

        return sendServiceError(res, result.error, result.statusCode);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

const readByRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId;

    if (!isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await PointService.getPointsByRoute(routeId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const updatePoint = async (req: Request, res: Response, next: NextFunction) => {
    const pointId = req.params.pointId;

    if (!isValidObjectId(pointId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await PointService.updatePoint(pointId, req.body);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const deletePoint = async (req: Request, res: Response, next: NextFunction) => {
    const pointId = req.params.pointId;

    if (!isValidObjectId(pointId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await PointService.deletePoint(pointId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

export default {
    createPoint,
    readPoint,
    readAll,
    readByRoute,
    updatePoint,
    deletePoint
};
