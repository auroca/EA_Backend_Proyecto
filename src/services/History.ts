import mongoose from 'mongoose';
import ChangeModel from '../models/Change';
import HistoryModel, { HistoryAction, HistoryEntity, IHistoryModel } from '../models/History';
import { PaginationParams } from '../library/Pagination';
import { ListResult, ServiceResult } from '../types/ServiceResult';

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
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [key, normalizeValue(entryValue)]));
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

const buildModifyChanges = (before: Record<string, unknown>, after: Record<string, unknown>, fields: string[]) => {
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

const recordHistory = async (entity: HistoryEntity, action: HistoryAction, objectId: string, changes: HistoryChange[]) => {
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
        throw new Error('Invalid objectId');
    }

    const parsedObjectId = new mongoose.Types.ObjectId(objectId);

    const history = await new HistoryModel({
        action,
        entity,
        changes: []
    }).save();

    const changeDocuments = await ChangeModel.insertMany(
        changes.map((change) => ({
            historyId: history._id,
            objectId: parsedObjectId,
            fieldName: change.fieldName,
            beforeValue: change.beforeValue,
            afterValue: change.afterValue
        }))
    );

    history.changes = changeDocuments.map((changeDocument) => changeDocument._id);
    await history.save();

    return history;
};

const getHistory = async (historyId: string): Promise<ServiceResult<IHistoryModel>> => {
    try {
        const history = await HistoryModel.findById(historyId).populate('changes').exec();

        if (!history) {
            return { success: false, error: `No history found with ID: ${historyId}`, statusCode: 404 };
        }

        return { success: true, data: history };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const createHistory = async (data: Partial<{ action: HistoryAction; entity: HistoryEntity }>): Promise<ServiceResult<IHistoryModel>> => {
    try {
        if (!data.action || !data.entity) {
            return { success: false, error: 'Invalid history data', statusCode: 400 };
        }

        const history = new HistoryModel({
            action: data.action,
            entity: data.entity,
            changes: []
        });

        const savedHistory = await history.save();
        return { success: true, data: savedHistory };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const updateHistory = async (historyId: string, data: Partial<{ action: HistoryAction; entity: HistoryEntity }>): Promise<ServiceResult<IHistoryModel>> => {
    try {
        const history = await HistoryModel.findById(historyId).exec();

        if (!history) {
            return { success: false, error: `No history found with ID: ${historyId}`, statusCode: 404 };
        }

        history.set(data);
        const savedHistory = await history.save();

        return { success: true, data: savedHistory };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const deleteHistory = async (historyId: string): Promise<ServiceResult<IHistoryModel>> => {
    try {
        const history = await HistoryModel.findById(historyId).exec();

        if (!history) {
            return { success: false, error: `No history found with ID: ${historyId}`, statusCode: 404 };
        }

        await ChangeModel.deleteMany({ historyId }).exec();
        const deletedHistory = await HistoryModel.findByIdAndDelete(historyId).exec();

        if (!deletedHistory) {
            return { success: false, error: `No history found with ID: ${historyId}`, statusCode: 404 };
        }

        return { success: true, data: deletedHistory };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

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

const getAllHistory = async (pagination?: PaginationParams): Promise<ServiceResult<ListResult<IHistoryModel>>> => {
    try {
        if (!pagination) {
            const history = await HistoryModel.find().sort({ _id: -1 }).populate('changes').exec();
            return { success: true, data: history };
        }

        const { limit, page } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([HistoryModel.find().sort({ _id: -1 }).skip(skip).limit(limit).populate('changes').exec(), HistoryModel.countDocuments()]);

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
