import PointModel, { IPoint } from '../models/Point';
import { PaginationParams } from '../library/Pagination';

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
    return await point.save();
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

    const [data, total] = await Promise.all([
        PointModel.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).exec(),
        PointModel.countDocuments(effectiveFilter)
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

const getPointsByRoute = async (routeId: string) => {
    return await PointModel.find({ routeId }).sort({ index: 1 }).exec();
};

const updatePoint = async (pointId: string, input: Partial<IPoint>) => {
    return await PointModel.findByIdAndUpdate(pointId, input, { new: true }).exec();
};

const deletePoint = async (pointId: string) => {
    return await PointModel.findByIdAndDelete(pointId).exec();
};

export default {
    createPoint,
    getPoint,
    getAllPoints,
    getPointsByRoute,
    updatePoint,
    deletePoint
};