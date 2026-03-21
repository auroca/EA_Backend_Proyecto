import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { IJwtPayload, UserRole } from '../models/JwtPayload';
import RouteModel from '../models/Route';
import PointModel from '../models/Point';

export interface AuthRequest extends Request {
    user?: IJwtPayload;
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Access token expirado' });
        }

        return res.status(401).json({ message: 'Token inválido' });
    }
};

export const authorizeRoles = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
        }

        next();
    };
};

export const authorizeSelfOrAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (req.user.rol === 'admin' || req.user.id === userId) {
        return next();
    }

    return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
};

export const authorizeRouteOwnerOrAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (req.user.rol === 'admin') {
            return next();
        }

        const routeId = req.params.routeId ?? req.params.RouteId;

        if (!routeId) {
            return res.status(400).json({ message: 'routeId is required' });
        }

        const route = await RouteModel.findById(routeId).exec();

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        if (route.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permisos para modificar esta ruta' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const authorizePointRouteOwnerOrAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (req.user.rol === 'admin') {
            return next();
        }

        const routeId = req.body.routeId;

        if (!routeId) {
            return res.status(400).json({ message: 'routeId is required' });
        }

        const route = await RouteModel.findById(routeId).exec();

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        if (route.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permisos para añadir puntos a esta ruta' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const authorizePointOwnerOrAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (req.user.rol === 'admin') {
            return next();
        }

        const pointId = req.params.pointId;

        const point = await PointModel.findById(pointId).exec();

        if (!point) {
            return res.status(404).json({ message: 'Point not found' });
        }

        const route = await RouteModel.findById(point.routeId).exec();

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        if (route.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permisos para modificar este punto' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ error });
    }
};