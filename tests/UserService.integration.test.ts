import './setup';

import { describe, expect, it } from 'vitest';

import User from '../src/models/User';
import UserService from '../src/services/User';
import { TEST_USER } from './setup';

describe('UserService integration', () => {
    it('gets a seeded user by id with a real test database', async () => {
        const user = await User.findOne({ email: TEST_USER.email }).exec();

        expect(user).not.toBeNull();

        const result = await UserService.getUser(String(user!._id));

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.email).toBe(TEST_USER.email);
            expect(result.data.username).toBe(TEST_USER.username);
        }
    });

    it('creates a user with lowercased email and records history', async () => {
        const result = await UserService.createUser({
            name: 'New',
            surname: 'User',
            username: 'new_user',
            email: 'NEW_USER@TEST.COM',
            password: 'password123',
            enabled: true,
            role: 'user',
            favoriteRoutes: []
        });

        expect(result.success).toBe(true);

        const savedUser = await User.findOne({ username: 'new_user' }).exec();

        expect(savedUser).not.toBeNull();
        expect(savedUser?.email).toBe('new_user@test.com');
        expect(savedUser?.password).not.toBe('password123');
    });

    it('returns conflict when username or email already exists', async () => {
        const result = await UserService.createUser({
            name: 'Duplicated',
            surname: 'User',
            username: TEST_USER.username,
            email: 'another@test.com',
            password: 'password123',
            enabled: true,
            role: 'user',
            favoriteRoutes: []
        });

        expect(result).toEqual({
            success: false,
            error: 'Username or email already exists',
            statusCode: 409
        });
    });
});
