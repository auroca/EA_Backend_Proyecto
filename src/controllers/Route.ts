import { NextFunction, Request, Response } from 'express';
import RouteService from '../services/Route';
import NotificationService from '../services/Notification';
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
            { name: 'wheelchairAccessible', type: 'boolean' },
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

const readWheelchairAccessible = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);
        const result = await RouteService.getWheelchairAccessibleRoutes(pagination);

        if (result.success) {
            return res.status(200).json(result.data);
        }

        return sendServiceError(res, result.error, result.statusCode);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

const readInsidePolygon = async (req: Request, res: Response, next: NextFunction) => {
    const coordinates = req.body?.coordinates;

    if (!Array.isArray(coordinates)) {
        return res.status(400).json({
            status: 'error',
            message: 'coordinates must be an array of [longitude, latitude]'
        });
    }

    const parsedCoordinates = coordinates.filter((coordinate: unknown): coordinate is [number, number] => {
        if (!Array.isArray(coordinate) || coordinate.length !== 2) {
            return false;
        }

        const longitude = coordinate[0];
        const latitude = coordinate[1];

        return typeof longitude === 'number' && typeof latitude === 'number' && longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
    });

    if (parsedCoordinates.length !== coordinates.length || parsedCoordinates.length < 3) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid polygon. Use at least 3 coordinates with format [longitude, latitude]. Longitude must be between -180 and 180 and latitude between -90 and 90'
        });
    }

    const result = await RouteService.getRoutesInsidePolygon(parsedCoordinates);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
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
        void (async () => {
            try {
                await NotificationService.notifyFavoriteRouteUpdated(routeId, result.data?.name);
            } catch {
                // Push notifications are best-effort; the route update response should not fail.
            }
        })();

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
    readWheelchairAccessible,
    readInsidePolygon,
    updateRoute,
    deleteRoute
};
