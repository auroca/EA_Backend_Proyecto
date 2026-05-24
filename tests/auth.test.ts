import { beforeEach, describe, expect, it, vi } from 'vitest';

import User from '../src/models/User';
import { createSocketUserSession } from '../src/library/Socket';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../src/utils/jwt';
import { getLoginPayload, refreshUserSession, validateUserCredentials } from '../src/services/auth';

vi.mock('../src/models/User', () => ({
    default: {
        findOne: vi.fn(),
        findById: vi.fn()
    }
}));

vi.mock('../src/utils/jwt', () => ({
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn()
}));

vi.mock('../src/library/Socket', () => ({
    createSocketUserSession: vi.fn()
}));

const mockedUser = vi.mocked(User);
const mockedGenerateAccessToken = vi.mocked(generateAccessToken);
const mockedGenerateRefreshToken = vi.mocked(generateRefreshToken);
const mockedVerifyRefreshToken = vi.mocked(verifyRefreshToken);
const mockedCreateSocketUserSession = vi.mocked(createSocketUserSession);

describe('auth service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateUserCredentials', () => {
        it('finds the user by lowercased email and returns it when password matches', async () => {
            const user = {
                enabled: true,
                comparePassword: vi.fn().mockResolvedValue(true)
            };
            mockedUser.findOne.mockReturnValue(createQuery(user) as any);

            const result = await validateUserCredentials('TEST@EMAIL.COM', 'secret');

            expect(mockedUser.findOne).toHaveBeenCalledWith({ email: 'test@email.com' });
            expect(user.comparePassword).toHaveBeenCalledWith('secret');
            expect(result).toBe(user);
        });

        it('returns null when user does not exist, is disabled, or password does not match', async () => {
            mockedUser.findOne.mockReturnValueOnce(createQuery(null) as any);
            await expect(validateUserCredentials('a@test.com', 'secret')).resolves.toBeNull();

            mockedUser.findOne.mockReturnValueOnce(createQuery({ enabled: false }) as any);
            await expect(validateUserCredentials('a@test.com', 'secret')).resolves.toBeNull();

            mockedUser.findOne.mockReturnValueOnce(
                createQuery({
                    enabled: true,
                    comparePassword: vi.fn().mockResolvedValue(false)
                }) as any
            );
            await expect(validateUserCredentials('a@test.com', 'secret')).resolves.toBeNull();
        });
    });

    describe('getLoginPayload', () => {
        it('returns tokens and socket session data for the user', () => {
            const user = {
                _id: 'user-1',
                username: 'judit',
                email: 'judit@test.com',
                role: 'user'
            };
            mockedGenerateAccessToken.mockReturnValue('access-token');
            mockedGenerateRefreshToken.mockReturnValue('refresh-token');
            mockedCreateSocketUserSession.mockReturnValue({
                user_id: 'user-1',
                username: 'judit',
                room: 'user:user-1'
            });

            expect(getLoginPayload(user)).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                socket: {
                    user_id: 'user-1',
                    username: 'judit',
                    room: 'user:user-1'
                }
            });
        });
    });

    describe('refreshUserSession', () => {
        it('refreshes tokens for an enabled user', async () => {
            mockedVerifyRefreshToken.mockReturnValue({
                id: 'user-1',
                username: 'judit',
                email: 'judit@test.com',
                rol: 'user'
            });
            mockedUser.findById.mockReturnValue(
                createQuery({
                    _id: 'user-1',
                    username: 'judit',
                    email: 'judit@test.com',
                    role: 'user',
                    enabled: true
                }) as any
            );
            mockedGenerateAccessToken.mockReturnValue('new-access-token');
            mockedGenerateRefreshToken.mockReturnValue('new-refresh-token');

            await expect(refreshUserSession('valid-refresh-token')).resolves.toEqual({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token'
            });
            expect(mockedVerifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
            expect(mockedUser.findById).toHaveBeenCalledWith('user-1');
        });

        it('throws when the user cannot be refreshed', async () => {
            mockedVerifyRefreshToken.mockReturnValue({
                id: 'missing-user',
                username: 'judit',
                email: 'judit@test.com',
                rol: 'user'
            });
            mockedUser.findById.mockReturnValue(createQuery(null) as any);

            await expect(refreshUserSession('valid-refresh-token')).rejects.toThrow('User not found');
        });
    });
});

const createQuery = (value: unknown) => ({
    exec: vi.fn().mockResolvedValue(value)
});
