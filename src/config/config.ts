import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/trip2guide';
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'clave_super_secreta_para_access_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'clave_todavia_mas_secreta_para_refresh_456';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    jwt: {
        accessSecret: JWT_ACCESS_SECRET,
        refreshSecret: JWT_REFRESH_SECRET,
        accessExpiresIn: JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: JWT_REFRESH_EXPIRES_IN
    },
    cors: {
        origins: CORS_ORIGINS
    },
    cookies: {
        refreshName: 'refreshToken',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/'
        }
    }
};