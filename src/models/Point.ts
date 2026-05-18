import mongoose, { Document, Schema } from 'mongoose';

export interface IPoint {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    image?: string;
    routeId: string;
    index: number;
}

export interface IPointModel extends IPoint, Document {}

const PointSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        image: { type: String },
        routeId: {
            type: Schema.Types.ObjectId,
            ref: 'Route',
            required: true
        },
        index: { type: Number, required: true }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IPointModel>('Point', PointSchema);
