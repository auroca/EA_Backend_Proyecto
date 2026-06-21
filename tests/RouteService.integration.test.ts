import './setup';

import { describe, expect, it } from 'vitest';

import Point from '../src/models/Point';
import Route from '../src/models/Route';
import User from '../src/models/User';
import RouteService from '../src/services/Route';
import { TEST_USER } from './setup';

type RouteWithId = {
    _id: unknown;
};

describe('RouteService integration', () => {
    it('creates a route with points and exposes point images in the route response', async () => {
        const user = await User.findOne({ email: TEST_USER.email }).exec();

        expect(user).not.toBeNull();

        const result = await RouteService.createRoute({
            name: 'Barcelona Gothic Quarter',
            description: 'A walking route through the old city center',
            cover_image: 'cover.jpg',
            city: 'Barcelona',
            country: 'Spain',
            distance: 2.4,
            duration: 75,
            difficulty: 'easy',
            wheelchairAccessible: true,
            tags: ['history', 'walking'],
            userId: String(user!._id),
            points: [
                {
                    name: 'Cathedral',
                    description: 'First stop',
                    latitude: 41.3839,
                    longitude: 2.1763,
                    image: 'cathedral.jpg'
                },
                {
                    name: 'Placa Reial',
                    description: 'Second stop',
                    latitude: 41.3801,
                    longitude: 2.1753,
                    image: 'placa-reial.jpg'
                }
            ]
        } as any);

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.name).toBe('Barcelona Gothic Quarter');
            expect(result.data.wheelchairAccessible).toBe(true);
            expect(result.data.points).toHaveLength(2);
            expect(result.data.points.map((point) => point.name)).toEqual(['Cathedral', 'Placa Reial']);
            expect(result.data.images).toEqual(['cathedral.jpg', 'placa-reial.jpg']);
        }

        await expect(Route.countDocuments({ userId: user!._id })).resolves.toBe(1);
        await expect(Point.countDocuments()).resolves.toBe(2);
    });

    it('stores, updates and filters routes by wheelchair accessibility', async () => {
        const user = await User.findOne({ email: TEST_USER.email }).exec();
        expect(user).not.toBeNull();

        const accessibleRoute = await RouteService.createRoute({
            name: 'Accessible city walk',
            description: 'A smooth route through the city center',
            cover_image: 'cover.jpg',
            city: 'Barcelona',
            country: 'Spain',
            distance: 3,
            duration: 60,
            difficulty: 'easy',
            wheelchairAccessible: true,
            tags: ['accessible'],
            userId: String(user!._id)
        } as any);

        const defaultRoute = await RouteService.createRoute({
            name: 'Mountain stairs',
            description: 'A route with steep stairs',
            cover_image: 'cover.jpg',
            city: 'Barcelona',
            country: 'Spain',
            distance: 5,
            duration: 90,
            difficulty: 'hard',
            tags: ['stairs'],
            userId: String(user!._id)
        } as any);

        expect(accessibleRoute.success).toBe(true);
        expect(defaultRoute.success).toBe(true);

        if (!accessibleRoute.success || !defaultRoute.success) {
            return;
        }

        expect(defaultRoute.data.wheelchairAccessible).toBe(false);

        const filtered = await RouteService.getAllRoutes(undefined, { wheelchairAccessible: true });
        expect(filtered.success).toBe(true);

        if (filtered.success && Array.isArray(filtered.data)) {
            expect(filtered.data.map((route) => route.name)).toEqual(['Accessible city walk']);
        }

        const accessibleOnly = await RouteService.getWheelchairAccessibleRoutes();
        expect(accessibleOnly.success).toBe(true);

        if (accessibleOnly.success && Array.isArray(accessibleOnly.data)) {
            expect(accessibleOnly.data.map((route) => route.name)).toEqual(['Accessible city walk']);
        }

        const updated = await RouteService.updateRoute(String((defaultRoute.data as unknown as RouteWithId)._id), {
            wheelchairAccessible: true
        });

        expect(updated.success).toBe(true);

        if (updated.success) {
            expect(updated.data.wheelchairAccessible).toBe(true);
        }
    });

    it('deletes a route and its points', async () => {
        const user = await User.findOne({ email: TEST_USER.email }).exec();
        expect(user).not.toBeNull();

        const created = await RouteService.createRoute({
            name: 'Route to delete',
            description: 'Temporary route',
            cover_image: 'cover.jpg',
            city: 'Madrid',
            country: 'Spain',
            distance: 1.5,
            duration: 30,
            difficulty: 'medium',
            tags: ['temporary'],
            userId: String(user!._id),
            points: [
                {
                    name: 'Point to delete',
                    latitude: 40.4168,
                    longitude: -3.7038,
                    image: 'point.jpg'
                }
            ]
        } as any);

        expect(created.success).toBe(true);
        if (!created.success) {
            return;
        }

        const routeId = String((created.data as unknown as RouteWithId)._id);
        const result = await RouteService.deleteRoute(routeId);

        expect(result.success).toBe(true);
        await expect(Route.findById(routeId).exec()).resolves.toBeNull();
        await expect(Point.countDocuments({ routeId })).resolves.toBe(0);
    });
});
