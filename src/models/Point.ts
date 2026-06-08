import mongoose, { Document, Schema } from 'mongoose';

export interface IPoint {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    image?: string;
    routeId: string;
    index: number;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
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
        index: { type: Number, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

PointSchema.pre('validate', function (next) {
    const point = this as IPointModel;

    point.location = {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
    };

    next();
});

PointSchema.index({ location: '2dsphere' });

export default mongoose.model<IPointModel>('Point', PointSchema);
