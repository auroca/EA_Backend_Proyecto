import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { IJwtPayload, UserRole } from '../models/JwtPayload';

export const generateAccessToken = (
    userId: string,
    name: string,
    email: string,
    rol: UserRole
) => {
    const payload: IJwtPayload = {
        id: userId,
        name,
        email,
        rol
    };

    return jwt.sign(
        payload,
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] }
    );
};

export const generateRefreshToken = (
    userId: string,
    name: string,
    email: string,
    rol: UserRole
) => {
    const payload: IJwtPayload = {
        id: userId,
        name,
        email,
        rol
    };

    return jwt.sign(
        payload,
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.jwt.accessSecret) as IJwtPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.jwt.refreshSecret) as IJwtPayload;
};