import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach } from 'vitest';

import User from '../src/models/User';

export const TEST_MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/trip2guide-test';

export const TEST_ADMIN = {
    name: 'Test',
    surname: 'Admin',
    username: 'test_admin',
    email: 'admin@test.com',
    password: 'password123',
    enabled: true,
    role: 'admin' as const,
    favoriteRoutes: []
};

export const TEST_USER = {
    name: 'Test',
    surname: 'User',
    username: 'test_user',
    email: 'user@test.com',
    password: 'password123',
    enabled: true,
    role: 'user' as const,
    favoriteRoutes: []
};

export const TEST_DISABLED_USER = {
    name: 'Disabled',
    surname: 'User',
    username: 'disabled_user',
    email: 'disabled@test.com',
    password: 'password123',
    enabled: false,
    role: 'user' as const,
    favoriteRoutes: []
};

const ensureTestDatabase = () => {
    const databaseName = new URL(TEST_MONGO_URI).pathname.replace('/', '');

    if (!databaseName.includes('test')) {
        throw new Error(`Refusing to run tests against non-test database: ${databaseName}`);
    }
};

beforeAll(async () => {
    ensureTestDatabase();
    mongoose.set('strictQuery', true);

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(TEST_MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
    }
}, 10000);

beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }

    await User.create(TEST_ADMIN);
    await User.create(TEST_USER);
    await User.create(TEST_DISABLED_USER);
});

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
}, 10000);
