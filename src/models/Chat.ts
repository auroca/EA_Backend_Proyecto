import mongoose, { Document, Schema } from 'mongoose';

export interface IChat {
    name: string;
    participants: mongoose.Types.ObjectId[];
    chatHistory: {
        userId: mongoose.Types.ObjectId;
        message: string;
        timestamp: Date;
    }[];
    password: string | null;
}

export interface IChatModel extends IChat, Document {}

const ChatSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],
        chatHistory: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                message: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        password: { type: String, default: null }
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

export default mongoose.model<IChatModel>('Chat', ChatSchema);
