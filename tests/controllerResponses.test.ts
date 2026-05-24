import { describe, expect, it, vi } from 'vitest';

import { isValidObjectId, sendServiceError } from '../src/utils/controllerResponses';

describe('isValidObjectId', () => {
    it('requires a defined 24-character id', () => {
        expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
        expect(isValidObjectId('short-id')).toBe(false);
        expect(isValidObjectId(undefined)).toBe(false);
    });
});

describe('sendServiceError', () => {
    it('returns a generic message for unexpected server errors', () => {
        const res = createResponseMock();

        sendServiceError(res, 'database exploded');

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Unexpected server error'
        });
    });

    it('returns the provided message for non-500 errors', () => {
        const res = createResponseMock();

        sendServiceError(res, 'Route not found', 404);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Route not found'
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

    return res as any;
};
