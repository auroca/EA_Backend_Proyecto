import PointModel, { IPoint } from '../models/Point';
import { PaginationParams } from '../library/Pagination';
import HistoryService from './History';
import { ListResult, ServiceResult } from '../types/ServiceResult';

const POINT_FIELDS = ['name', 'description', 'latitude', 'longitude', 'image', 'routeId', 'index'];

const createPoint = async (input: IPoint): Promise<ServiceResult<IPoint>> => {
    try {
        const point = new PointModel(input);
        const savedPoint = await point.save();

        await HistoryService.recordHistory('POINT', 'CREATE', String(savedPoint._id), HistoryService.buildCreateChanges(savedPoint.toObject() as Record<string, unknown>, POINT_FIELDS));

        return { success: true, data: savedPoint };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getPoint = async (pointId: string): Promise<ServiceResult<IPoint>> => {
    try {
        const point = await PointModel.findById(pointId).exec();

        if (!point) {
            return { success: false, error: `No point found with ID: ${pointId}`, statusCode: 404 };
        }

        return { success: true, data: point };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getAllPoints = async (pagination?: PaginationParams, filter?: Record<string, unknown>): Promise<ServiceResult<ListResult<IPoint>>> => {
    try {
        const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

        if (!pagination) {
            const points = await PointModel.find(effectiveFilter).sort({ _id: 1 }).exec();
            return { success: true, data: points };
        }

        const { limit, page } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([PointModel.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).exec(), PointModel.countDocuments(effectiveFilter)]);

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

const getPointsByRoute = async (routeId: string): Promise<ServiceResult<IPoint[]>> => {
    try {
        const points = await PointModel.find({ routeId }).sort({ index: 1 }).exec();
        return { success: true, data: points };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const updatePoint = async (pointId: string, input: Partial<IPoint>): Promise<ServiceResult<IPoint>> => {
    try {
        const point = await PointModel.findById(pointId).exec();

        if (!point) {
            return { success: false, error: `No point found with ID: ${pointId}`, statusCode: 404 };
        }

        const before = point.toObject() as Record<string, unknown>;
        const afterPreview = {
            ...before,
            ...input
        } as Record<string, unknown>;

        const changedFields = HistoryService.buildModifyChanges(before, afterPreview, POINT_FIELDS).map((change) => change.fieldName);

        if (changedFields.length === 0) {
            return { success: true, data: point };
        }

        point.set(input);
        const savedPoint = await point.save();

        await HistoryService.recordHistory('POINT', 'MODIFY', String(savedPoint._id), HistoryService.buildModifyChanges(before, savedPoint.toObject() as Record<string, unknown>, changedFields));

        return { success: true, data: savedPoint };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const deletePoint = async (pointId: string): Promise<ServiceResult<IPoint>> => {
    try {
        const point = await PointModel.findById(pointId).exec();

        if (!point) {
            return { success: false, error: `No point found with ID: ${pointId}`, statusCode: 404 };
        }

        const before = point.toObject() as Record<string, unknown>;
        const deletedPoint = await PointModel.findByIdAndDelete(pointId).exec();

        if (!deletedPoint) {
            return { success: false, error: `No point found with ID: ${pointId}`, statusCode: 404 };
        }

        await HistoryService.recordHistory('POINT', 'DELETE', String(deletedPoint._id), HistoryService.buildDeleteChanges(before, POINT_FIELDS));

        return { success: true, data: deletedPoint };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

export default {
    createPoint,
    getPoint,
    getAllPoints,
    getPointsByRoute,
    updatePoint,
    deletePoint
};
