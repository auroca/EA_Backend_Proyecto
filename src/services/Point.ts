import PointModel, { IPoint } from '../models/Point';
import { PaginationParams } from '../library/Pagination';
import HistoryService from './History';

const POINT_FIELDS = ['name', 'description', 'latitude', 'longitude', 'image', 'routeId', 'index'];

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

const createPoint = async (input: IPoint) => {
    const point = new PointModel(input);
    const savedPoint = await point.save();

    await HistoryService.recordHistory(
        'POINT',
        'CREATE',
        String(savedPoint._id),
        HistoryService.buildCreateChanges(savedPoint.toObject() as Record<string, unknown>, POINT_FIELDS)
    );

    return savedPoint;
};

const getPoint = async (pointId: string) => {
    return await PointModel.findById(pointId).exec();
};

const getAllPoints = async (pagination?: PaginationParams, filter?: any): Promise<ListResult<IPoint>> => {
    const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

    if (!pagination) {
        return await PointModel.find(effectiveFilter).sort({ _id: 1 }).exec();
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([PointModel.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).exec(), PointModel.countDocuments(effectiveFilter)]);

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

const getPointsByRoute = async (routeId: string) => {
    return await PointModel.find({ routeId }).sort({ index: 1 }).exec();
};

const updatePoint = async (pointId: string, input: Partial<IPoint>) => {
    const point = await PointModel.findById(pointId).exec();

    if (!point) {
        return null;
    }

    const before = point.toObject() as Record<string, unknown>;
    const afterPreview = {
        ...before,
        ...input
    } as Record<string, unknown>;

    const changedFields = HistoryService.buildModifyChanges(before, afterPreview, POINT_FIELDS).map(
        (change) => change.fieldName
    );

    if (changedFields.length === 0) {
        return point;
    }

    point.set(input);
    const savedPoint = await point.save();

    await HistoryService.recordHistory(
        'POINT',
        'MODIFY',
        String(savedPoint._id),
        HistoryService.buildModifyChanges(before, savedPoint.toObject() as Record<string, unknown>, changedFields)
    );

    return savedPoint;
};

const deletePoint = async (pointId: string) => {
    const point = await PointModel.findById(pointId).exec();

    if (!point) {
        return null;
    }

    const before = point.toObject() as Record<string, unknown>;
    const deletedPoint = await PointModel.findByIdAndDelete(pointId).exec();

    if (!deletedPoint) {
        return null;
    }

    await HistoryService.recordHistory(
        'POINT',
        'DELETE',
        String(deletedPoint._id),
        HistoryService.buildDeleteChanges(before, POINT_FIELDS)
    );

    return deletedPoint;
};

export default {
    createPoint,
    getPoint,
    getAllPoints,
    getPointsByRoute,
    updatePoint,
    deletePoint
};
