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

type RoutePointSummary = {
    _id: unknown;
    name: string;
    latitude: number;
    longitude: number;
};

type RouteResponse = Omit<IRoute, 'images'> & {
    images: string[];
    points: RoutePointSummary[];
};

const populateRoutePoints = (query: any) =>
    query.populate({
        path: 'points',
        select: '_id name latitude longitude image index',
        options: { sort: { index: 1 } }
    });

const formatRouteResponse = (route: any): RouteResponse | null => {
    if (!route) {
        return null;
    }

    const routeObject = typeof route.toObject === 'function' ? route.toObject() : route;
    const points = Array.isArray(routeObject.points) ? routeObject.points : [];

    const images = points.map((point: any) => point.image).filter((image: unknown): image is string => typeof image === 'string' && image.trim() !== '');

    return {
        ...routeObject,
        images,
        points: points.map((point: any) => ({
            _id: point._id,
            name: point.name,
            latitude: point.latitude,
            longitude: point.longitude
        }))
    };
};

const createRoute = async (input: IRoute) => {
    const route = new RouteModel(input);
    return await route.save();
};

const getRoute = async (routeId: string) => {
    const route = await populateRoutePoints(RouteModel.findById(routeId)).exec();
    return formatRouteResponse(route);
};

const getAllRoutes = async (pagination?: PaginationParams, filter?: any): Promise<ListResult<IRoute>> => {
    const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

    if (!pagination) {
        const routes = await populateRoutePoints(RouteModel.find(effectiveFilter).sort({ _id: 1 })).exec();
        return routes.map((route: any) => formatRouteResponse(route));
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([populateRoutePoints(RouteModel.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit)).exec(), RouteModel.countDocuments(effectiveFilter)]);

    return {
        data: data.map((route: any) => formatRouteResponse(route)),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateRoute = async (routeId: string, input: Partial<IRoute>) => {
    return await RouteModel.findByIdAndUpdate(routeId, input, { new: true }).populate('points').exec();
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
