import RouteModel, { IRoute } from '../models/Route';
import PointModel from '../models/Point';
import HistoryService from './History';
import { ListResult, ServiceResult } from '../types/ServiceResult';

const ROUTE_FIELDS = ['name', 'description', 'cover_image', 'city', 'country', 'distance', 'duration', 'difficulty', 'tags', 'userId'];
const POINT_FIELDS = ['name', 'description', 'latitude', 'longitude', 'image', 'routeId', 'index'];

type PaginationLimit = 10 | 25 | 50;

type PaginationParams = {
    limit: PaginationLimit;
    page: number;
};

type RoutePointInput = {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    image?: string;
    index?: number;
};

type RouteCreateInput = IRoute & {
    points?: RoutePointInput[];
};

type RoutePointSummary = {
    _id: unknown;
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    image?: string;
    routeId: unknown;
    index: number;
    createdAt?: Date;
    updatedAt?: Date;
};

type RouteResponse = IRoute & {
    images: string[];
    points: RoutePointSummary[];
};

type PolygonCoordinate = [number, number];

const populateRoutePoints = (query: any) =>
    query.populate({
        path: 'points',
        select: '_id name description latitude longitude image routeId index createdAt updatedAt',
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
            description: point.description,
            latitude: point.latitude,
            longitude: point.longitude,
            image: point.image,
            routeId: point.routeId,
            index: point.index,
            createdAt: point.createdAt,
            updatedAt: point.updatedAt
        }))
    };
};

const isRouteResponse = (route: RouteResponse | null): route is RouteResponse => route !== null;

const closePolygon = (coordinates: PolygonCoordinate[]): PolygonCoordinate[] => {
    if (coordinates.length === 0) {
        return coordinates;
    }

    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];

    if (first[0] === last[0] && first[1] === last[1]) {
        return coordinates;
    }

    return [...coordinates, first];
};

const createRoute = async (input: RouteCreateInput): Promise<ServiceResult<RouteResponse>> => {
    try {
        const { points, images, ...routeInput } = input as RouteCreateInput & { images?: string[] };

        const route = new RouteModel(routeInput);
        const savedRoute = await route.save();

        await HistoryService.recordHistory('ROUTE', 'CREATE', String(savedRoute._id), HistoryService.buildCreateChanges(savedRoute.toObject() as Record<string, unknown>, ROUTE_FIELDS));

        if (Array.isArray(points) && points.length > 0) {
            const pointDocuments = points.map((point, index) => ({
                name: point.name,
                description: point.description,
                latitude: point.latitude,
                longitude: point.longitude,
                image: point.image,
                routeId: savedRoute._id,
                index: typeof point.index === 'number' ? point.index : index,
                location: {
                    type: 'Point',
                    coordinates: [point.longitude, point.latitude]
                }
            }));

            const savedPoints = await PointModel.insertMany(pointDocuments);

            for (const savedPoint of savedPoints) {
                await HistoryService.recordHistory('POINT', 'CREATE', String(savedPoint._id), HistoryService.buildCreateChanges(savedPoint.toObject() as Record<string, unknown>, POINT_FIELDS));
            }
        }

        const routeWithPoints = await populateRoutePoints(RouteModel.findById(savedRoute._id)).exec();
        const formattedRoute = formatRouteResponse(routeWithPoints);

        if (!formattedRoute) {
            return { success: false, error: 'Route could not be loaded after creation', statusCode: 500 };
        }

        return { success: true, data: formattedRoute };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const getRoute = async (routeId: string): Promise<ServiceResult<RouteResponse>> => {
    try {
        const route = await populateRoutePoints(RouteModel.findById(routeId)).exec();
        const formattedRoute = formatRouteResponse(route);

        if (!formattedRoute) {
            return { success: false, error: `No route found with ID: ${routeId}`, statusCode: 404 };
        }

        return { success: true, data: formattedRoute };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const getAllRoutes = async (pagination?: PaginationParams, filter?: Record<string, unknown>): Promise<ServiceResult<ListResult<RouteResponse>>> => {
    try {
        const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

        if (!pagination) {
            const routes = await populateRoutePoints(RouteModel.find(effectiveFilter).sort({ _id: 1 })).exec();
            return { success: true, data: routes.map((route: any) => formatRouteResponse(route)).filter(isRouteResponse) };
        }

        const { limit, page } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([populateRoutePoints(RouteModel.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit)).exec(), RouteModel.countDocuments(effectiveFilter)]);

        return {
            success: true,
            data: {
                data: data.map((route: any) => formatRouteResponse(route)).filter(isRouteResponse),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const getRoutesInsidePolygon = async (coordinates: PolygonCoordinate[]): Promise<ServiceResult<RouteResponse[]>> => {
    try {
        if (!Array.isArray(coordinates) || coordinates.length < 3) {
            return { success: false, error: 'Polygon must contain at least 3 coordinates', statusCode: 400 };
        }

        const closedCoordinates = closePolygon(coordinates);

        const pointsInsidePolygon = await PointModel.find({
            location: {
                $geoWithin: {
                    $geometry: {
                        type: 'Polygon',
                        coordinates: [closedCoordinates]
                    }
                }
            }
        })
            .sort({ routeId: 1, index: 1 })
            .exec();

        const routeIdsWithPointsInside = [...new Set(pointsInsidePolygon.map((point: any) => String(point.routeId)))];

        const allPointsFromCandidateRoutes = await PointModel.find({
            routeId: { $in: routeIdsWithPointsInside }
        })
            .sort({ routeId: 1, index: 1 })
            .exec();

        const pointsInsideByRouteId = new Map<string, any[]>();
        const totalPointsByRouteId = new Map<string, number>();

        pointsInsidePolygon.forEach((point: any) => {
            const routeId = String(point.routeId);
            const currentPoints = pointsInsideByRouteId.get(routeId) ?? [];

            currentPoints.push(point);
            pointsInsideByRouteId.set(routeId, currentPoints);
        });

        allPointsFromCandidateRoutes.forEach((point: any) => {
            const routeId = String(point.routeId);
            const currentTotal = totalPointsByRouteId.get(routeId) ?? 0;

            totalPointsByRouteId.set(routeId, currentTotal + 1);
        });

        const routeIdsFullyInside = routeIdsWithPointsInside.filter((routeId) => {
            const insideCount = pointsInsideByRouteId.get(routeId)?.length ?? 0;
            const totalCount = totalPointsByRouteId.get(routeId) ?? 0;

            return totalCount > 0 && insideCount === totalCount;
        });

        const routes = await RouteModel.find({
            _id: { $in: routeIdsFullyInside }
        })
            .sort({ _id: 1 })
            .exec();

        const result = routes
            .map((route: any) => {
                const routeObject = typeof route.toObject === 'function' ? route.toObject() : route;
                const routePoints = pointsInsideByRouteId.get(String(routeObject._id)) ?? [];

                const images = routePoints
                    .map((point: any) => point.image)
                    .filter((image: unknown): image is string => typeof image === 'string' && image.trim() !== '');

                return {
                    ...routeObject,
                    images,
                    points: routePoints.map((point: any) => ({
                        _id: point._id,
                        name: point.name,
                        description: point.description,
                        latitude: point.latitude,
                        longitude: point.longitude,
                        image: point.image,
                        routeId: point.routeId,
                        index: point.index,
                        createdAt: point.createdAt,
                        updatedAt: point.updatedAt
                    }))
                };
            })
            .filter((route) => route.points.length > 0);

        return {
            success: true,
            data: result
        };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const updateRoute = async (routeId: string, input: Partial<IRoute>): Promise<ServiceResult<RouteResponse>> => {
    try {
        const route = await RouteModel.findById(routeId).exec();

        if (!route) {
            return { success: false, error: `No route found with ID: ${routeId}`, statusCode: 404 };
        }

        const before = route.toObject() as Record<string, unknown>;
        const afterPreview = {
            ...before,
            ...input
        } as Record<string, unknown>;

        const changedFields = HistoryService.buildModifyChanges(before, afterPreview, ROUTE_FIELDS).map((change) => change.fieldName);

        if (changedFields.length > 0) {
            route.set(input);
            const savedRoute = await route.save();

            await HistoryService.recordHistory('ROUTE', 'MODIFY', String(savedRoute._id), HistoryService.buildModifyChanges(before, savedRoute.toObject() as Record<string, unknown>, changedFields));
        }

        const routeWithPoints = await populateRoutePoints(RouteModel.findById(routeId)).exec();
        const formattedRoute = formatRouteResponse(routeWithPoints);

        if (!formattedRoute) {
            return { success: false, error: `No route found with ID: ${routeId}`, statusCode: 404 };
        }

        return { success: true, data: formattedRoute };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const deleteRoute = async (routeId: string): Promise<ServiceResult<IRoute>> => {
    try {
        const route = await RouteModel.findById(routeId).exec();

        if (!route) {
            return { success: false, error: `No route found with ID: ${routeId}`, statusCode: 404 };
        }

        const before = route.toObject() as Record<string, unknown>;
        await PointModel.deleteMany({ routeId }).exec();
        const deletedRoute = await RouteModel.findByIdAndDelete(routeId).exec();

        if (!deletedRoute) {
            return { success: false, error: `No route found with ID: ${routeId}`, statusCode: 404 };
        }

        await HistoryService.recordHistory('ROUTE', 'DELETE', String(deletedRoute._id), HistoryService.buildDeleteChanges(before, ROUTE_FIELDS));

        return { success: true, data: deletedRoute };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

export default {
    createRoute,
    getRoute,
    getAllRoutes,
    getRoutesInsidePolygon,
    updateRoute,
    deleteRoute
};