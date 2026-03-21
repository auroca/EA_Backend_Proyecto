import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import * as authService from '../services/auth';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        const user = await authService.validateUserCredentials(email, password);

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const { accessToken, refreshToken } = authService.getTokens(user);

        res.cookie(config.cookies.refreshName, refreshToken, {
            ...config.cookies.options,
            maxAge: config.cookies.maxAge
        });

        return res.status(200).json({
            message: 'Login exitoso',
            accessToken,
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
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incomingRefreshToken = req.cookies?.[config.cookies.refreshName] || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: 'Refresh token requerido' });
        }

        const { accessToken, refreshToken: newRefreshToken } = await authService.refreshUserSession(incomingRefreshToken);

        res.cookie(config.cookies.refreshName, newRefreshToken, {
            ...config.cookies.options,
            maxAge: config.cookies.maxAge
        });

        return res.status(200).json({
            message: 'Token refrescado',
            accessToken
        });
    } catch (error) {
        return res.status(401).json({ message: 'Refresh token expirado o inválido' });
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie(config.cookies.refreshName, {
            ...config.cookies.options
        });

        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).populate('routes').exec();

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error });
    }
};