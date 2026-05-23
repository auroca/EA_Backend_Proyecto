import { NextFunction, Request, Response } from 'express';
import RouteService from '../services/Route';
import { parsePagination } from '../library/Pagination';
import Filters, { FieldSpec } from '../library/Filters';
import { AuthRequest } from '../middleware/auth';
import { isValidObjectId, sendServiceError } from '../utils/controllerResponses';

const createRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id ?? req.body.userId;

    if (!userId) {
        return res.status(422).json({ status: 'error', message: 'userId is required' });
    }

    const result = await RouteService.createRoute({
        ...req.body,
        userId
    });

    if (result.success) {
        return res.status(201).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId ?? req.params.RouteId;

    if (!isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await RouteService.getRoute(routeId);

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
            { name: 'city', type: 'string' },
            { name: 'country', type: 'string' },
            { name: 'distance', type: 'number' },
            { name: 'duration', type: 'number' },
            { name: 'difficulty', type: 'string' },
            { name: 'tags', type: 'stringArray' },
            { name: 'images', type: 'stringArray' },
            { name: 'userId', type: 'id' }
        ];

        const sourceFilter = (req.query.filter as any) || {};
        const { filter, errors } = Filters.parseFilters(sourceFilter, allowedFields);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const result = await RouteService.getAllRoutes(pagination, filter);

        if (result.success) {
            return res.status(200).json(result.data);
        }

        return sendServiceError(res, result.error, result.statusCode);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId ?? req.params.RouteId;

    if (!isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const data = { ...req.body };
    delete data.userId;

    const result = await RouteService.updateRoute(routeId, data);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId ?? req.params.RouteId;

    if (!isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await RouteService.deleteRoute(routeId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

export default {
    createRoute,
    readRoute,
    readAll,
    updateRoute,
    deleteRoute
};
