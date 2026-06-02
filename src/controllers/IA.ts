import { NextFunction, Request, Response } from 'express';
import IAService from '../services/IA';
import { sendServiceError } from '../utils/controllerResponses';

const getQuestion = (body: Record<string, unknown>) => {
    const value = body.question ?? body.pregunta ?? body.text ?? body.message;
    return typeof value === 'string' ? value.trim() : '';
};

const recommend = async (req: Request, res: Response, next: NextFunction) => {
    const question = getQuestion(req.body);
    const limit = typeof req.body.limit === 'number' ? req.body.limit : undefined;

    const result = await IAService.recommend(question, limit);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

export default {
    recommend
};
