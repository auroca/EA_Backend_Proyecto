import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import * as authService from '../services/auth';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { sendServiceError } from '../utils/controllerResponses';

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
