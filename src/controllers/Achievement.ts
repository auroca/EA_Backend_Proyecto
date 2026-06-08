import { Request, Response } from 'express';
import AchievementService from '../services/Achievement';

const getMyAchievements = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const achievements = await AchievementService.evaluateUserAchievements(userId);

        return res.status(200).json({
            message: 'Logros obtenidos correctamente',
            data: achievements
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los logros',
            error
        });
    }
};

export default {
    getMyAchievements
};
