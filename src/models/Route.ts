import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute {
    name: string;
    description: string;
    city: string;
    country: string;
    distance: number;
    duration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    images: string[];
    userId: string;
}

export interface IRouteModel extends IRoute, Document {}

const RouteSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        distance: { type: Number, required: true },
        duration: { type: Number, required: true },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true
        },
        tags: [{ type: String }],
        images: [{ type: String }],
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
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

RouteSchema.virtual('points', {
    ref: 'Point',
    localField: '_id',
    foreignField: 'routeId',
    options: { sort: { index: 1 } }
});

export default mongoose.model<IRouteModel>('Route', RouteSchema);