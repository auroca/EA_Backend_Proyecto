import { NextFunction, Request, Response } from 'express';
import RouteService from '../services/Route';
import { parsePagination } from '../library/Pagination';
import { AuthRequest } from '../middleware/auth';

const createRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const savedRoute = await RouteService.createRoute({
            ...req.body,
            userId: req.user.id
        });

        return res.status(201).json(savedRoute);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId ?? req.params.RouteId;

    try {
        const route = await RouteService.getRoute(routeId);
        return route
            ? res.status(200).json(route)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);
        const routes = await RouteService.getAllRoutes(pagination);
        return res.status(200).json(routes);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId ?? req.params.RouteId;

    try {
        const data = { ...req.body };
        delete data.userId;

        const updatedRoute = await RouteService.updateRoute(routeId, data);
        return updatedRoute
            ? res.status(200).json(updatedRoute)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteRoute = async (req: Request, res: Response, next: NextFunction) => {
    const routeId = req.params.routeId ?? req.params.RouteId;

    try {
        const route = await RouteService.deleteRoute(routeId);
        return route
            ? res.status(200).json(route)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createRoute,
    readRoute,
    readAll,
    updateRoute,
    deleteRoute
};