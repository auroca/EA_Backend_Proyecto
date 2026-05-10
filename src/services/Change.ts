import mongoose from 'mongoose';
import ChangeModel, { IChange } from '../models/Change';
import HistoryModel from '../models/History';

const getAllChanges = async () => {
    return await ChangeModel.find().sort({ _id: -1 }).populate('historyId').exec();
};

const getChange = async (changeId: string) => {
    return await ChangeModel.findById(changeId).populate('historyId').exec();
};

const createChange = async (data: Partial<IChange>) => {
    if (!data.historyId || !data.objectId || !data.fieldName) {
        return null;
    }

    const history = await HistoryModel.findById(data.historyId).exec();

    if (!history) {
        return null;
    }

    const change = new ChangeModel({
        historyId: new mongoose.Types.ObjectId(String(data.historyId)),
        objectId: new mongoose.Types.ObjectId(String(data.objectId)),
        fieldName: data.fieldName,
        beforeValue: data.beforeValue ?? null,
        afterValue: data.afterValue ?? null,
        changedAt: data.changedAt ?? new Date()
    });

    const savedChange = await change.save();
    history.changes.push(savedChange._id);
    await history.save();

    return savedChange;
};

const updateChange = async (changeId: string, data: Partial<IChange>) => {
    const change = await ChangeModel.findById(changeId).exec();

    if (!change) {
        return null;
    }

    const previousHistoryId = change.historyId.toString();

    if (data.historyId && data.historyId.toString() !== previousHistoryId) {
        const previousHistory = await HistoryModel.findById(previousHistoryId).exec();
        if (previousHistory) {
            previousHistory.changes = previousHistory.changes.filter(
                (currentChangeId) => currentChangeId.toString() !== change._id.toString()
            );
            await previousHistory.save();
        }

        const nextHistory = await HistoryModel.findById(data.historyId).exec();
        if (!nextHistory) {
            return null;
        }

        nextHistory.changes.push(change._id);
        await nextHistory.save();

        change.historyId = new mongoose.Types.ObjectId(String(data.historyId));
    }

    if (data.objectId) {
        change.objectId = new mongoose.Types.ObjectId(String(data.objectId));
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

    return await change.save();
};

const deleteChange = async (changeId: string) => {
    const change = await ChangeModel.findById(changeId).exec();

    if (!change) {
        return null;
    }

    const history = await HistoryModel.findById(change.historyId).exec();

    if (history) {
        history.changes = history.changes.filter(
            (currentChangeId) => currentChangeId.toString() !== change._id.toString()
        );
        await history.save();
    }

    return await ChangeModel.findByIdAndDelete(changeId).exec();
};

export default {
    getAllChanges,
    getChange,
    createChange,
    updateChange,
    deleteChange
};