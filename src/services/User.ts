import mongoose from 'mongoose';
import User, { IUserModel, IUser } from '../models/User';
import RouteModel from '../models/Route';
import PointModel from '../models/Point';

type PaginationLimit = 10 | 25 | 50;

type PaginationParams = {
    limit: PaginationLimit;
    page: number;
};

type PaginatedResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

type ListResult<T> = PaginatedResult<T> | T[];

const createUser = async (data: Partial<IUser>): Promise<IUserModel> => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: data.email?.toLowerCase(),
        ...data
    });

    return await user.save();
};

const getUser = async (userId: string): Promise<IUserModel | null> => {
    return await User.findById(userId).populate('routes').populate('favoriteRoutes').exec();
};

const getAllUsers = async (pagination?: PaginationParams, filter?: any): Promise<ListResult<IUserModel>> => {
    const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

    if (!pagination) {
        return await User.find(effectiveFilter).sort({ _id: 1 }).populate('routes').populate('favoriteRoutes').exec();
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        User.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).populate('routes').populate('favoriteRoutes').exec(),
        User.countDocuments(effectiveFilter)
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateUser = async (userId: string, data: Partial<IUser>): Promise<IUserModel | null> => {
    const user = await User.findById(userId).exec();

    if (!user) {
        return null;
    }

    if (data.email) {
        data.email = data.email.toLowerCase();
    }

    user.set(data);
    return await user.save();
};

const deleteUser = async (userId: string): Promise<IUserModel | null> => {
    const routes = await RouteModel.find({ userId }).select('_id').lean().exec();
    const routeIds = routes.map((route) => route._id);

    if (routeIds.length > 0) {
        await PointModel.deleteMany({ routeId: { $in: routeIds } }).exec();
        await RouteModel.deleteMany({ userId }).exec();
    }

    return await User.findByIdAndDelete(userId).exec();
};

const getFavoriteRoutes = async (userId: string) => {
    return await User.findById(userId).populate('favoriteRoutes').select('favoriteRoutes').exec();
};

const addFavoriteRoute = async (userId: string, routeId: string) => {
    return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favoriteRoutes: routeId } },
        { new: true }
    )
        .populate('favoriteRoutes')
        .select('favoriteRoutes')
        .exec();
};

const removeFavoriteRoute = async (userId: string, routeId: string) => {
    return await User.findByIdAndUpdate(
        userId,
        { $pull: { favoriteRoutes: routeId } },
        { new: true }
    )
        .populate('favoriteRoutes')
        .select('favoriteRoutes')
        .exec();
};

const toggleFavoriteRoute = async (userId: string, routeId: string) => {
    const user = await User.findById(userId).exec();

    if (!user) {
        return null;
    }

    const alreadyFavorite = user.favoriteRoutes.some((favoriteId) => favoriteId.toString() === routeId);

    if (alreadyFavorite) {
        user.favoriteRoutes = user.favoriteRoutes.filter((favoriteId) => favoriteId.toString() !== routeId);
    } else {
        user.favoriteRoutes.push(new mongoose.Types.ObjectId(routeId));
    }

    await user.save();

    return await User.findById(userId).populate('favoriteRoutes').select('favoriteRoutes').exec();
};

export default {
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getFavoriteRoutes,
    addFavoriteRoute,
    removeFavoriteRoute,
    toggleFavoriteRoute
};