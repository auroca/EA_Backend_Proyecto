import mongoose from 'mongoose';
import User, { IUserModel, IUser } from '../models/User';
import RouteModel from '../models/Route';
import PointModel from '../models/Point';
import HistoryService from './History';
import { ListResult, ServiceResult } from '../types/ServiceResult';

const USER_FIELDS = ['name', 'surname', 'username', 'email', 'password', 'enabled', 'role'];

type PaginationLimit = 10 | 25 | 50;

type PaginationParams = {
    limit: PaginationLimit;
    page: number;
};

const isDuplicateKeyError = (err: unknown): boolean => typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 11000;

const createUser = async (data: Partial<IUser>): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            ...data,
            email: data.email?.toLowerCase()
        });

        const savedUser = await user.save();

        await HistoryService.recordHistory('USER', 'CREATE', String(savedUser._id), HistoryService.buildCreateChanges(savedUser.toObject() as Record<string, unknown>, USER_FIELDS));

        return { success: true, data: savedUser };
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return { success: false, error: 'Username or email already exists', statusCode: 409 };
        }

        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getUser = async (userId: string): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findById(userId).populate('routes').populate('favoriteRoutes').exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        return { success: true, data: user };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getAllUsers = async (pagination?: PaginationParams, filter?: Record<string, unknown>): Promise<ServiceResult<ListResult<IUserModel>>> => {
    try {
        const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

        if (!pagination) {
            const users = await User.find(effectiveFilter).sort({ _id: 1 }).populate('routes').populate('favoriteRoutes').exec();
            return { success: true, data: users };
        }

        const { limit, page } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            User.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).populate('routes').populate('favoriteRoutes').exec(),
            User.countDocuments(effectiveFilter)
        ]);

        return {
            success: true,
            data: {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const updateUser = async (userId: string, data: Partial<IUser>): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        const normalizedData: Partial<IUser> = { ...data };

        if (normalizedData.email) {
            normalizedData.email = normalizedData.email.toLowerCase();
        }

        const before = user.toObject() as Record<string, unknown>;
        const afterPreview = {
            ...before,
            ...normalizedData
        } as Record<string, unknown>;

        const changedFields = HistoryService.buildModifyChanges(before, afterPreview, USER_FIELDS).map((change) => change.fieldName);

        if (changedFields.length === 0) {
            return { success: true, data: user };
        }

        user.set(normalizedData);
        const savedUser = await user.save();
        const after = savedUser.toObject() as Record<string, unknown>;

        await HistoryService.recordHistory(
            'USER',
            changedFields.length === 1 && changedFields[0] === 'enabled' ? 'STATUS' : 'MODIFY',
            String(savedUser._id),
            HistoryService.buildModifyChanges(before, after, changedFields)
        );

        return { success: true, data: savedUser };
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return { success: false, error: 'Username or email already exists', statusCode: 409 };
        }

        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const deleteUser = async (userId: string): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        const before = user.toObject() as Record<string, unknown>;
        const routes = await RouteModel.find({ userId }).select('_id').lean().exec();
        const routeIds = routes.map((route) => route._id);

        if (routeIds.length > 0) {
            await PointModel.deleteMany({ routeId: { $in: routeIds } }).exec();
            await RouteModel.deleteMany({ userId }).exec();
        }

        const deletedUser = await User.findByIdAndDelete(userId).exec();

        if (!deletedUser) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        await HistoryService.recordHistory('USER', 'DELETE', String(deletedUser._id), HistoryService.buildDeleteChanges(before, USER_FIELDS));

        return { success: true, data: deletedUser };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getFavoriteRoutes = async (userId: string): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findById(userId).populate('favoriteRoutes').select('favoriteRoutes').exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        return { success: true, data: user };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const addFavoriteRoute = async (userId: string, routeId: string): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findByIdAndUpdate(userId, { $addToSet: { favoriteRoutes: routeId } }, { new: true })
            .populate('favoriteRoutes')
            .select('favoriteRoutes')
            .exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        return { success: true, data: user };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const removeFavoriteRoute = async (userId: string, routeId: string): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findByIdAndUpdate(userId, { $pull: { favoriteRoutes: routeId } }, { new: true })
            .populate('favoriteRoutes')
            .select('favoriteRoutes')
            .exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        return { success: true, data: user };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const toggleFavoriteRoute = async (userId: string, routeId: string): Promise<ServiceResult<IUserModel>> => {
    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        const alreadyFavorite = user.favoriteRoutes.some((favoriteId) => favoriteId.toString() === routeId);

        if (alreadyFavorite) {
            user.favoriteRoutes = user.favoriteRoutes.filter((favoriteId) => favoriteId.toString() !== routeId);
        } else {
            user.favoriteRoutes.push(new mongoose.Types.ObjectId(routeId));
        }

        await user.save();
        const updatedUser = await User.findById(userId).populate('favoriteRoutes').select('favoriteRoutes').exec();

        if (!updatedUser) {
            return { success: false, error: `No user found with ID: ${userId}`, statusCode: 404 };
        }

        return { success: true, data: updatedUser };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
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
