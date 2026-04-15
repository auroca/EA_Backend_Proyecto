import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Request, Response } from 'express';
import Logging from '../library/Logging';

export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const ValidateQuery = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.query);
            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    Auth: {
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        })
    },

    User: {
        create: Joi.object({
            name: Joi.string().required(),
            surname: Joi.string().required(),
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        }),
        update: Joi.object({
            name: Joi.string().optional(),
            surname: Joi.string().optional(),
            username: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(),
            enabled: Joi.boolean().optional(),
            role: Joi.string().valid('admin', 'user').optional()
        }).min(1)
        ,

        listQuery: Joi.object({
            filter: Joi.object({
                name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                surname: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                username: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                email: Joi.alternatives().try(Joi.string().email(), Joi.array().items(Joi.string().email())).optional(),
                enabled: Joi.alternatives().try(Joi.boolean(), Joi.array().items(Joi.boolean())).optional(),
                role: Joi.alternatives().try(Joi.string().valid('admin', 'user'), Joi.array().items(Joi.string().valid('admin', 'user'))).optional()
            }).optional(),
            limit: Joi.number().valid(10, 25, 50).optional(),
            page: Joi.number().min(1).optional()
        }).optional()
    },

    Route: {
        create: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            city: Joi.string().required(),
            country: Joi.string().required(),
            distance: Joi.number().required(),
            duration: Joi.number().required(),
            difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
            tags: Joi.array().items(Joi.string()).optional(),
            userId: Joi.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .optional()
        }),

        update: Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            city: Joi.string().optional(),
            country: Joi.string().optional(),
            distance: Joi.number().optional(),
            duration: Joi.number().optional(),
            difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
            tags: Joi.array().items(Joi.string()).optional()
        }).min(1)
        ,

        // Query/list schema for filter and pagination
        listQuery: Joi.object({
            filter: Joi.object({
                name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                description: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                city: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                country: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                distance: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())).optional(),
                duration: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())).optional(),
                difficulty: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                userId: Joi.alternatives().try(Joi.string().pattern(/^[0-9a-fA-F]{24}$/), Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))).optional()
            }).optional(),
            limit: Joi.number().valid(10, 25, 50).optional(),
            page: Joi.number().min(1).optional()
        }).optional()
    },

    Point: {
        create: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().optional(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            image: Joi.string().allow('').optional(),
            routeId: Joi.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .required(),
            index: Joi.number().integer().min(0).required()
        }),

        update: Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().optional(),
            latitude: Joi.number().optional(),
            longitude: Joi.number().optional(),
            image: Joi.string().allow('').optional(),
            routeId: Joi.string()
                .pattern(/^[0-9a-fA-F]{24}$/)
                .optional(),
            index: Joi.number().integer().min(0).optional()
        }).min(1)
        ,

        listQuery: Joi.object({
            filter: Joi.object({
                name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                description: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
                latitude: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())).optional(),
                longitude: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())).optional(),
                routeId: Joi.alternatives().try(Joi.string().pattern(/^[0-9a-fA-F]{24}$/), Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))).optional(),
                index: Joi.alternatives().try(Joi.number().integer(), Joi.array().items(Joi.number().integer())).optional()
            }).optional(),
            limit: Joi.number().valid(10, 25, 50).optional(),
            page: Joi.number().min(1).optional()
        }).optional()
    }
};