import { NextFunction, Request, Response } from 'express';
import UserService from '../services/User';
import { parsePagination } from '../library/Pagination';
import Filters, { FieldSpec } from '../library/Filters';
import { isValidObjectId, sendServiceError } from '../utils/controllerResponses';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
        name: req.body.name,
        surname: req.body.surname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        enabled: true,
        role: 'user' as const
    };

    const result = await UserService.createUser(payload);

    if (result.success) {
        return res.status(201).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await UserService.getUser(userId);

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
            { name: 'surname', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'enabled', type: 'boolean' },
            { name: 'role', type: 'string' }
        ];

        const sourceFilter = (req.query.filter as any) || {};
        const { filter, errors } = Filters.parseFilters(sourceFilter, allowedFields);
        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const result = await UserService.getAllUsers(pagination, filter);

        if (result.success) {
            return res.status(200).json(result.data);
        }

        return sendServiceError(res, result.error, result.statusCode);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await UserService.updateUser(userId, req.body);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await UserService.deleteUser(userId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const readFavorites = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await UserService.getFavoriteRoutes(userId);

    if (result.success) {
        return res.status(200).json(result.data.favoriteRoutes);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;
    const routeId = req.params.routeId ?? req.params.RouteId;

    if (!isValidObjectId(userId) || !isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided IDs have an invalid format' });
    }

    const result = await UserService.addFavoriteRoute(userId, routeId);

    if (result.success) {
        return res.status(200).json(result.data.favoriteRoutes);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;
    const routeId = req.params.routeId ?? req.params.RouteId;

    if (!isValidObjectId(userId) || !isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided IDs have an invalid format' });
    }

    const result = await UserService.removeFavoriteRoute(userId, routeId);

    if (result.success) {
        return res.status(200).json(result.data.favoriteRoutes);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;
    const routeId = req.params.routeId ?? req.params.RouteId;

    if (!isValidObjectId(userId) || !isValidObjectId(routeId)) {
        return res.status(400).json({ status: 'error', message: 'Provided IDs have an invalid format' });
    }

    const result = await UserService.toggleFavoriteRoute(userId, routeId);

    if (result.success) {
        return res.status(200).json(result.data.favoriteRoutes);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const registerFcmToken = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Provided ID has an invalid format'
        });
    }

    const result = await UserService.registerFcmToken(userId, req.body.token, req.body.platform);

    if (result.success) {
        return res.status(200).json({
            message: 'FCM token registered'
        });
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const unregisterFcmToken = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Provided ID has an invalid format'
        });
    }

    const result = await UserService.unregisterFcmToken(userId, req.body.token);

    if (result.success) {
        return res.status(200).json({
            message: 'FCM token removed'
        });
    }

    return sendServiceError(res, result.error, result.statusCode);
};

export default {
    createUser,
    readUser,
    readAll,
    updateUser,
    deleteUser,
    readFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    registerFcmToken,
    unregisterFcmToken
};
