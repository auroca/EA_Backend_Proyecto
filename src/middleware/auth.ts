import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt';
import { IJwtPayload, UserRole } from '../models/JwtPayload';
import RouteModel from '../models/Route';
import PointModel from '../models/Point';
import ChatModel from '../models/Chat';
import { sendServiceError } from '../utils/controllerResponses';

export interface AuthRequest extends Request {
    user?: IJwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Access token expired' });
        }

        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const authorizeRoles = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'You do not have permission to access this resource' });
        }

        next();
    };
};

export const authorizeSelfOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.rol === 'admin' || req.user.id === userId) {
        return next();
    }

    return res.status(403).json({ message: 'You do not have permission to access this resource' });
};

export const authorizeRouteOwnerOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
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
            return res.status(403).json({ message: 'You do not have permission to modify this route' });
        }

        return next();
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const authorizePointRouteOwnerOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
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
            return res.status(403).json({ message: 'You do not have permission to add points to this route' });
        }

        return next();
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const authorizePointOwnerOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
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
            return res.status(403).json({ message: 'You do not have permission to modify this point' });
        }

        return next();
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const authorizeChatParticipantOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (req.user.rol === 'admin') {
            return next();
        }

        const chatId = req.params.chatId ?? req.params.ChatId;

        if (!chatId) {
            return res.status(400).json({ message: 'chatId is required' });
        }

        const chat = await ChatModel.findById(chatId).select('participants').exec();

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const isParticipant = chat.participants.some((participantId) => participantId.toString() === req.user!.id);

        if (!isParticipant) {
            return res.status(403).json({ message: 'You do not have permission to access this chat' });
        }

        return next();
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};
