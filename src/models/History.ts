import mongoose, { Document, Schema } from 'mongoose';

export type HistoryAction = 'CREATE' | 'MODIFY' | 'STATUS' | 'DELETE';
export type HistoryEntity = 'USER' | 'ROUTE' | 'POINT';

export interface IHistory {
    action: HistoryAction;
    entity: HistoryEntity;
    changes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IHistoryModel extends IHistory, Document {}

const HistorySchema: Schema = new Schema(
    {
        action: {
            type: String,
            enum: ['CREATE', 'MODIFY', 'STATUS', 'DELETE'],
            required: true
        },
        entity: {
            type: String,
            enum: ['USER', 'ROUTE', 'POINT'],
            required: true
        },
        changes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Change'
            }
        ]
    },
    {
        timestamps: true,
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

export default mongoose.model<IHistoryModel>('History', HistorySchema);