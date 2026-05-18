import mongoose, { Document, Schema } from 'mongoose';

export interface IChange {
    historyId: mongoose.Types.ObjectId;
    objectId: mongoose.Types.ObjectId;
    fieldName: string;
    beforeValue: unknown;
    afterValue: unknown;
    changedAt: Date;
}

export interface IChangeModel extends IChange, Document {}

const ChangeSchema: Schema = new Schema(
    {
        historyId: {
            type: Schema.Types.ObjectId,
            ref: 'History',
            required: true
        },
        objectId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        fieldName: {
            type: String,
            required: true
        },
        beforeValue: {
            type: Schema.Types.Mixed,
            default: null
        },
        afterValue: {
            type: Schema.Types.Mixed,
            default: null
        },
        changedAt: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        versionKey: false,
        id: false,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

export default mongoose.model<IChangeModel>('Change', ChangeSchema);