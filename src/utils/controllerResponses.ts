import { Response } from 'express';

export const sendServiceError = (res: Response, error: string, statusCode = 500) => {
    return res.status(statusCode).json({
        status: 'error',
        message: statusCode === 500 ? 'Unexpected server error' : error
    });
};

export const isValidObjectId = (id: string | undefined): id is string => !!id && id.length === 24;
