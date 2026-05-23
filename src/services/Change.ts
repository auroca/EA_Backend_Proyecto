import mongoose from 'mongoose';
import ChangeModel, { IChangeModel, IChange } from '../models/Change';
import HistoryModel from '../models/History';
import { ServiceResult } from '../types/ServiceResult';

const toObjectId = (value: unknown): mongoose.Types.ObjectId | null => {
    const objectIdValue = String(value);

    if (!mongoose.Types.ObjectId.isValid(objectIdValue)) {
        return null;
    }

    return new mongoose.Types.ObjectId(objectIdValue);
};

const getAllChanges = async (): Promise<ServiceResult<IChangeModel[]>> => {
    try {
        const changes = await ChangeModel.find().sort({ _id: -1 }).populate('historyId').exec();
        return { success: true, data: changes };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const getChange = async (changeId: string): Promise<ServiceResult<IChangeModel>> => {
    try {
        const change = await ChangeModel.findById(changeId).populate('historyId').exec();

        if (!change) {
            return { success: false, error: `No change found with ID: ${changeId}`, statusCode: 404 };
        }

        return { success: true, data: change };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const createChange = async (data: Partial<IChange>): Promise<ServiceResult<IChangeModel>> => {
    try {
        const historyId = toObjectId(data.historyId);
        const objectId = toObjectId(data.objectId);

        if (!historyId || !objectId || !data.fieldName) {
            return { success: false, error: 'Invalid change data', statusCode: 400 };
        }

        const history = await HistoryModel.findById(historyId).exec();

        if (!history) {
            return { success: false, error: `No history found with ID: ${historyId}`, statusCode: 404 };
        }

        const change = new ChangeModel({
            historyId,
            objectId,
            fieldName: data.fieldName,
            beforeValue: data.beforeValue ?? null,
            afterValue: data.afterValue ?? null,
            changedAt: data.changedAt ?? new Date()
        });

        const savedChange = await change.save();
        history.changes.push(savedChange._id);
        await history.save();

        return { success: true, data: savedChange };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const updateChange = async (changeId: string, data: Partial<IChange>): Promise<ServiceResult<IChangeModel>> => {
    try {
        const change = await ChangeModel.findById(changeId).exec();

        if (!change) {
            return { success: false, error: `No change found with ID: ${changeId}`, statusCode: 404 };
        }

        const previousHistoryId = change.historyId.toString();

        if (data.historyId && data.historyId.toString() !== previousHistoryId) {
            const nextHistoryId = toObjectId(data.historyId);

            if (!nextHistoryId) {
                return { success: false, error: 'Invalid historyId', statusCode: 400 };
            }

            const previousHistory = await HistoryModel.findById(previousHistoryId).exec();
            if (previousHistory) {
                previousHistory.changes = previousHistory.changes.filter((currentChangeId) => currentChangeId.toString() !== change._id.toString());
                await previousHistory.save();
            }

            const nextHistory = await HistoryModel.findById(nextHistoryId).exec();
            if (!nextHistory) {
                return { success: false, error: `No history found with ID: ${nextHistoryId}`, statusCode: 404 };
            }

            nextHistory.changes.push(change._id);
            await nextHistory.save();

            change.historyId = nextHistoryId;
        }

        if (data.objectId) {
            const objectId = toObjectId(data.objectId);

            if (!objectId) {
                return { success: false, error: 'Invalid objectId', statusCode: 400 };
            }

            change.objectId = objectId;
        }

        if (data.fieldName !== undefined) {
            change.fieldName = data.fieldName;
        }

        if (data.beforeValue !== undefined) {
            change.beforeValue = data.beforeValue;
        }

        if (data.afterValue !== undefined) {
            change.afterValue = data.afterValue;
        }

        if (data.changedAt !== undefined) {
            change.changedAt = data.changedAt;
        }

        const savedChange = await change.save();
        return { success: true, data: savedChange };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const deleteChange = async (changeId: string): Promise<ServiceResult<IChangeModel>> => {
    try {
        const change = await ChangeModel.findById(changeId).exec();

        if (!change) {
            return { success: false, error: `No change found with ID: ${changeId}`, statusCode: 404 };
        }

        const history = await HistoryModel.findById(change.historyId).exec();

        if (history) {
            history.changes = history.changes.filter((currentChangeId) => currentChangeId.toString() !== change._id.toString());
            await history.save();
        }

        const deletedChange = await ChangeModel.findByIdAndDelete(changeId).exec();

        if (!deletedChange) {
            return { success: false, error: `No change found with ID: ${changeId}`, statusCode: 404 };
        }

        return { success: true, data: deletedChange };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

export default {
    getAllChanges,
    getChange,
    createChange,
    updateChange,
    deleteChange
};
