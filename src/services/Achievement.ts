import RouteModel from '../models/Route';
import UserModel from '../models/User';
import AchievementModel from '../models/Achievement';
import UserAchievementModel from '../models/UserAchievement';

const ACHIEVEMENTS = [
    {
        code: 'FIRST_ROUTE',
        title: 'Primer paso',
        description: 'Has subido tu primera ruta.',
        icon: '🗺️'
    },
    {
        code: 'FIVE_ROUTES',
        title: 'Explorador',
        description: 'Has subido 5 rutas.',
        icon: '🏔️'
    },
    {
        code: 'FIRST_FAVORITE',
        title: 'Buen gusto',
        description: 'Has guardado tu primera ruta favorita.',
        icon: '⭐'
    },
    {
        code: 'TEN_FAVORITES',
        title: 'Coleccionista',
        description: 'Tienes 10 rutas en favoritos.',
        icon: '🏆'
    }
] as const;

const seedAchievements = async () => {
    await Promise.all(ACHIEVEMENTS.map((achievement) => AchievementModel.updateOne({ code: achievement.code }, { $setOnInsert: achievement }, { upsert: true })));
};

const unlock = async (userId: string, achievementCode: string) => {
    await UserAchievementModel.updateOne({ userId, achievementCode }, { $setOnInsert: { userId, achievementCode, unlockedAt: new Date() } }, { upsert: true });
};

const evaluateUserAchievements = async (userId: string) => {
    await seedAchievements();

    const routesCount = await RouteModel.countDocuments({ userId });

    const user = await UserModel.findById(userId).lean();
    const favoritesCount = Array.isArray((user as any)?.favoriteRoutes) ? (user as any).favoriteRoutes.length : 0;

    if (routesCount >= 1) await unlock(userId, 'FIRST_ROUTE');
    if (routesCount >= 5) await unlock(userId, 'FIVE_ROUTES');
    if (favoritesCount >= 1) await unlock(userId, 'FIRST_FAVORITE');
    if (favoritesCount >= 10) await unlock(userId, 'TEN_FAVORITES');

    return getUserAchievements(userId);
};

const getUserAchievements = async (userId: string) => {
    await seedAchievements();

    const achievements = await AchievementModel.find().lean();
    const unlocked = await UserAchievementModel.find({ userId }).lean();

    const unlockedMap = new Map(unlocked.map((item) => [item.achievementCode, item.unlockedAt]));

    return achievements.map((achievement) => ({
        ...achievement,
        unlocked: unlockedMap.has(achievement.code),
        unlockedAt: unlockedMap.get(achievement.code) ?? null
    }));
};

export default {
    seedAchievements,
    evaluateUserAchievements,
    getUserAchievements
};
