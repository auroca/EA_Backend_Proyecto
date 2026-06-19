import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/trip2guide';
const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'clave_super_secreta_para_access_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'clave_todavia_mas_secreta_para_refresh_456';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4200,http://localhost:51755,http://localhost:1337')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '136495957431-f36ubav6rnlu1aultggn38u5a239masj.apps.googleusercontent.com';

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
    oauth: {
        googleClientId: GOOGLE_CLIENT_ID
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
    },
    ia: {
        llmUrl: process.env.UPC_LLM_URL || 'http://10.4.119.50:8080/api/generate',
        llmModel: process.env.UPC_LLM_MODEL || 'qwen2.5:14b',
        publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${SERVER_PORT}`,
        routeSearchLimit: process.env.IA_ROUTE_SEARCH_LIMIT ? Number(process.env.IA_ROUTE_SEARCH_LIMIT) : 5
    },
    weaviate: {
        url: process.env.WEAVIATE_URL || '',
        apiKey: process.env.WEAVIATE_API_KEY || '',
        routesCollection: process.env.WEAVIATE_ROUTES_COLLECTION || 'Routes'
    }
};
