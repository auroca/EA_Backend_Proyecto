import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserController from '../src/controllers/User';
import UserService from '../src/services/User';

vi.mock('../src/services/User', () => ({
    default: {
        createUser: vi.fn(),
        getUser: vi.fn(),
        getAllUsers: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        getFavoriteRoutes: vi.fn(),
        addFavoriteRoute: vi.fn(),
        removeFavoriteRoute: vi.fn(),
        toggleFavoriteRoute: vi.fn()
    }
}));

const mockedUserService = vi.mocked(UserService);

describe('UserController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a user with enabled true and user role', async () => {
        const createdUser = {
            _id: '507f1f77bcf86cd799439011',
            name: 'Judit',
            surname: 'Test',
            username: 'judit',
            email: 'judit@test.com',
            enabled: true,
            role: 'user'
        };
        mockedUserService.createUser.mockResolvedValue({ success: true, data: createdUser } as any);
        const res = createResponseMock();

        await UserController.createUser(
            {
                body: {
                    name: 'Judit',
                    surname: 'Test',
                    username: 'judit',
                    email: 'judit@test.com',
                    password: 'secret'
                }
            } as any,
            res as any,
            vi.fn()
        );

        expect(mockedUserService.createUser).toHaveBeenCalledWith({
            name: 'Judit',
            surname: 'Test',
            username: 'judit',
            email: 'judit@test.com',
            password: 'secret',
            enabled: true,
            role: 'user'
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it('rejects readUser when the id format is invalid', async () => {
        const res = createResponseMock();

        await UserController.readUser({ params: { userId: 'bad-id' } } as any, res as any, vi.fn());

        expect(mockedUserService.getUser).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Provided ID has an invalid format'
        });
    });

    it('returns a user when readUser receives a valid id', async () => {
        const user = {
            _id: '507f1f77bcf86cd799439011',
            username: 'judit'
        };
        mockedUserService.getUser.mockResolvedValue({ success: true, data: user } as any);
        const res = createResponseMock();

        await UserController.readUser({ params: { userId: '507f1f77bcf86cd799439011' } } as any, res as any, vi.fn());

        expect(mockedUserService.getUser).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(user);
    });

    it('returns favorite routes from the service response', async () => {
        const favoriteRoutes = [{ _id: 'route-1', name: 'Barcelona walk' }];
        mockedUserService.getFavoriteRoutes.mockResolvedValue({
            success: true,
            data: { favoriteRoutes }
        } as any);
        const res = createResponseMock();

        await UserController.readFavorites({ params: { userId: '507f1f77bcf86cd799439011' } } as any, res as any, vi.fn());

        expect(mockedUserService.getFavoriteRoutes).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(favoriteRoutes);
    });

    it('returns filter validation errors before calling getAllUsers', async () => {
        const res = createResponseMock();

        await UserController.readAll(
            {
                query: {
                    filter: {
                        unknown: 'value'
                    }
                }
            } as any,
            res as any,
            vi.fn()
        );

        expect(mockedUserService.getAllUsers).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            errors: ['field not allowed: unknown']
        });
    });
});

const createResponseMock = () => {
    const res = {
        status: vi.fn(),
        json: vi.fn()
    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;
};
