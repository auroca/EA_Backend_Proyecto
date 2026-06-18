import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import * as authService from '../services/auth';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { sendServiceError } from '../utils/controllerResponses';
import Route from '../models/Route';
import Point from '../models/Point';
import Review from '../models/Review';

const buildLoginResponse = (user: any, accessToken: string, socket: any) => ({
    message: 'Login successful',
    accessToken,
    socket,
    user: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        enabled: user.enabled,
        role: user.role
    }
});

const createUsername = (email: string) => {
    return email.split('@')[0] + '_' + Date.now();
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        const user = await authService.validateUserCredentials(email, password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken, socket } = authService.getLoginPayload(user);

        res.cookie(config.cookies.refreshName, refreshToken, {
            ...config.cookies.options,
            maxAge: config.cookies.maxAge
        });

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            socket,
            user: {
                _id: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                email: user.email,
                enabled: user.enabled,
                role: user.role
            }
        });
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incomingRefreshToken = req.cookies?.[config.cookies.refreshName] || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const { accessToken, refreshToken: newRefreshToken } = await authService.refreshUserSession(incomingRefreshToken);

        res.cookie(config.cookies.refreshName, newRefreshToken, {
            ...config.cookies.options,
            maxAge: config.cookies.maxAge
        });

        return res.status(200).json({
            message: 'Token refreshed',
            accessToken
        });
    } catch {
        return res.status(401).json({ message: 'Refresh token expired or invalid' });
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie(config.cookies.refreshName, {
            ...config.cookies.options
        });

        return res.status(200).json({ message: 'Logout successful' });
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).populate('routes').exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const getCreatorStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const routeIds = await Route.find({ userId }).distinct('_id');

        const routesCreated = routeIds.length;

        const pointsCreated = await Point.countDocuments({
            routeId: { $in: routeIds }
        });

        const reviewsWritten = await Review.countDocuments({ userId });

        return res.status(200).json({
            routesCreated,
            pointsCreated,
            reviewsWritten
        });
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

export const loginGoogle = async (req: Request, res: Response) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ message: 'accessToken required' });
        }

        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const googleUser = await googleResponse.json();

        if (!googleResponse.ok) {
            return res.status(401).json({
                message: 'Invalid Google token',
                error: googleUser
            });
        }

        if (!googleUser.email || !googleUser.sub) {
            return res.status(401).json({ message: 'Invalid Google user' });
        }

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            user = await User.create({
                name: googleUser.given_name || googleUser.name || 'Usuario',
                surname: googleUser.family_name || '',
                username: createUsername(googleUser.email),
                email: googleUser.email,
                enabled: true,
                role: 'user',
                authProvider: 'google',
                providerId: googleUser.sub,
                favoriteRoutes: []
            });
        }

        const { accessToken: appAccessToken, refreshToken, socket } = authService.getLoginPayload(user);

        res.cookie(config.cookies.refreshName, refreshToken, {
            ...config.cookies.options,
            maxAge: config.cookies.maxAge
        });

        return res.status(200).json(buildLoginResponse(user, appAccessToken, socket));
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid Google login',
            error: error instanceof Error ? error.message : error
        });
    }
};
