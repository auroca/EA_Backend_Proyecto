import RouteModel, { IRoute } from '../models/Route';
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

const createRoute = async (input: IRoute) => {
    const route = new RouteModel(input);
    return await route.save();
};

const getRoute = async (routeId: string) => {
    return await RouteModel.findById(routeId).populate('points').exec();
};

const getAllRoutes = async (
    pagination?: PaginationParams,
    filter?: any
): Promise<ListResult<IRoute>> => {
    const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

    if (!pagination) {
        return await RouteModel.find(effectiveFilter).sort({ _id: 1 }).populate('points').exec();
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        RouteModel.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).populate('points').exec(),
        RouteModel.countDocuments(effectiveFilter)
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

const updateRoute = async (routeId: string, input: Partial<IRoute>) => {
    return await RouteModel.findByIdAndUpdate(routeId, input, { new: true })
        .populate('points')
        .exec();
};

const deleteRoute = async (routeId: string) => {
    await PointModel.deleteMany({ routeId }).exec();
    return await RouteModel.findByIdAndDelete(routeId).exec();
};

export default {
    createRoute,
    getRoute,
    getAllRoutes,
    updateRoute,
    deleteRoute
};