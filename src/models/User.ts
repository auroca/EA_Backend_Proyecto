import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string;
    favoriteRoutes: Types.ObjectId[];
    completedRoutes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        favoriteRoutes: {
            type: [Schema.Types.ObjectId],
            ref: 'Route',
            default: []
        },
        completedRoutes: {
            type: [Schema.Types.ObjectId],
            ref: 'Route',
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IUserModel>('User', UserSchema);