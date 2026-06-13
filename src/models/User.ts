import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from './JwtPayload';

export interface IUser {
    name: string;
    surname?: string;
    username: string;
    email: string;
    password?: string;
    enabled: boolean;
    role: UserRole;
    authProvider: 'local' | 'google';
    providerId?: string;
    favoriteRoutes: mongoose.Types.ObjectId[];
    fcmTokens: {
        token: string;
        platform: 'android' | 'ios' | 'web';
        updatedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserModel extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: false, default: '' },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        enabled: { type: Boolean, default: true },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
            required: true
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
            required: true
        },
        providerId: {
            type: String,
            required: false
        },
        favoriteRoutes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Route',
                default: []
            }
        ],
        fcmTokens: {
            type: [
                {
                    token: { type: String, required: true },
                    platform: {
                        type: String,
                        enum: ['android', 'ios', 'web'],
                        required: true
                    },
                    updatedAt: { type: Date, default: Date.now }
                }
            ],
            default: [],
            select: false
        }
    },
    {
        timestamps: true,
        versionKey: false,
        id: false,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.fcmTokens;
                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

UserSchema.virtual('routes', {
    ref: 'Route',
    localField: '_id',
    foreignField: 'userId',
    select: 'name _id'
});

UserSchema.pre('save', async function (next) {
    const user = this as IUserModel;

    if (!user.password || !user.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) {
        return false;
    }

    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserModel>('User', UserSchema);
