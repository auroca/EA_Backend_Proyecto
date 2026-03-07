import { NextFunction, Request, Response } from 'express';
import UserService from '../services/User';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
   

    try {
       const savedUser = await UserService.createUser(req.body);
        return res.status(201).json(savedUser);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readUser = async (req: Request, res: Response, next: NextFunction) => {
    const UserId = req.params.UserId;

    try {
        const User = await UserService.getUser(UserId);
        return User ? res.status(200).json(User) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Users = await UserService.getAllUsers();
        return res.status(200).json(Users);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const UserId = req.params.UserId;
    try {
        const updatedUser = await UserService.updateUser(UserId, req.body);
        return updatedUser ? res.status(201).json(updatedUser) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};


const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const UserId = req.params.UserId;

    try {
        const User = await UserService.deleteUser(UserId);
        return User ? res.status(201).json(User) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default { createUser, readUser, readAll, updateUser, deleteUser };
