import { NextFunction, Request, Response } from 'express';
import UserService from '../services/User';
import { parsePagination } from '../library/Pagination';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = {
            name: req.body.name,
            surname: req.body.surname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            enabled: true,
            role: 'user' as const
        };

        const savedUser = await UserService.createUser(payload);
        return res.status(201).json(savedUser);
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        return res.status(500).json({ error });
    }
};

const readUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        const user = await UserService.getUser(userId);
        return user
            ? res.status(200).json(user)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);
        const users = await UserService.getAllUsers(pagination);
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        const updatedUser = await UserService.updateUser(userId, req.body);
        return updatedUser
            ? res.status(200).json(updatedUser)
            : res.status(404).json({ message: 'not found' });
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        return res.status(500).json({ error });
    }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        const user = await UserService.deleteUser(userId);
        return user
            ? res.status(200).json(user)
            : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createUser,
    readUser,
    readAll,
    updateUser,
    deleteUser
};