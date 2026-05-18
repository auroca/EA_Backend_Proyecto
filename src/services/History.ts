import mongoose from 'mongoose';
import ChangeModel from '../models/Change';
import HistoryModel, { HistoryAction, HistoryEntity } from '../models/History';
import { PaginationParams } from '../library/Pagination';

export type HistoryChange = {
    fieldName: string;
    beforeValue: unknown;
    afterValue: unknown;
};

const valueOrNull = (value: unknown) => (value === undefined ? null : value);

const normalizeValue = (value: unknown): unknown => {
    if (value instanceof mongoose.Types.ObjectId) {
        return value.toString();
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map((item) => normalizeValue(item));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
                key,
                normalizeValue(entryValue)
            ])
        );
    }

    return value;
};

const valuesEqual = (firstValue: unknown, secondValue: unknown) => {
    return JSON.stringify(normalizeValue(firstValue)) === JSON.stringify(normalizeValue(secondValue));
};

const buildCreateChanges = (source: Record<string, unknown>, fields: string[]): HistoryChange[] => {
    return fields.map((fieldName) => ({
        fieldName,
        beforeValue: null,
        afterValue: valueOrNull(source[fieldName])
    }));
};

const buildModifyChanges = (
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    fields: string[]
) => {
    return fields
        .filter((fieldName) => !valuesEqual(before[fieldName], after[fieldName]))
        .map((fieldName) => ({
            fieldName,
            beforeValue: valueOrNull(before[fieldName]),
            afterValue: valueOrNull(after[fieldName])
        }));
};

const buildDeleteChanges = (source: Record<string, unknown>, fields: string[]): HistoryChange[] => {
    return fields.map((fieldName) => ({
        fieldName,
        beforeValue: valueOrNull(source[fieldName]),
        afterValue: null
    }));
};

const recordHistory = async (
    entity: HistoryEntity,
    action: HistoryAction,
    objectId: string,
    changes: HistoryChange[]
) => {
    const history = await new HistoryModel({
        action,
        entity,
        changes: []
    }).save();

    const changeDocuments = await ChangeModel.insertMany(
        changes.map((change) => ({
            historyId: history._id,
            objectId: new mongoose.Types.ObjectId(objectId),
            fieldName: change.fieldName,
            beforeValue: change.beforeValue,
            afterValue: change.afterValue
        }))
    );

    history.changes = changeDocuments.map((changeDocument) => changeDocument._id);
    await history.save();

    return history;
};

const getHistory = async (historyId: string) => {
    return await HistoryModel.findById(historyId).populate('changes').exec();
};

const createHistory = async (data: Partial<{ action: HistoryAction; entity: HistoryEntity }>) => {
    const history = new HistoryModel({
        action: data.action,
        entity: data.entity,
        changes: []
    });

    return await history.save();
};

const updateHistory = async (historyId: string, data: Partial<{ action: HistoryAction; entity: HistoryEntity }>) => {
    const history = await HistoryModel.findById(historyId).exec();

    if (!history) {
        return null;
    }

    history.set(data);
    return await history.save();
};

const deleteHistory = async (historyId: string) => {
    await ChangeModel.deleteMany({ historyId }).exec();
    return await HistoryModel.findByIdAndDelete(historyId).exec();
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

interface HistoryServiceApi {
    buildCreateChanges: typeof buildCreateChanges;
    buildModifyChanges: typeof buildModifyChanges;
    buildDeleteChanges: typeof buildDeleteChanges;
    recordHistory: typeof recordHistory;
    getAllHistory: typeof getAllHistory;
    getHistory: typeof getHistory;
    createHistory: typeof createHistory;
    updateHistory: typeof updateHistory;
    deleteHistory: typeof deleteHistory;
    valuesEqual: typeof valuesEqual;
}

const getAllHistory = async (pagination?: PaginationParams): Promise<ListResult<unknown>> => {
    if (!pagination) {
        return await HistoryModel.find().sort({ _id: -1 }).populate('changes').exec();
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        HistoryModel.find().sort({ _id: -1 }).skip(skip).limit(limit).populate('changes').exec(),
        HistoryModel.countDocuments()
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

const HistoryService: HistoryServiceApi = {
    buildCreateChanges,
    buildModifyChanges,
    buildDeleteChanges,
    recordHistory,
    getAllHistory,
    getHistory,
    createHistory,
    updateHistory,
    deleteHistory,
    valuesEqual
};

export default HistoryService;