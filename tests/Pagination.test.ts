import { describe, expect, it } from 'vitest';

import { parsePagination } from '../src/library/Pagination';

describe('parsePagination', () => {
    it('returns undefined when pagination params are missing', () => {
        expect(parsePagination({})).toBeUndefined();
    });

    it('returns undefined when only one pagination param is provided', () => {
        expect(parsePagination({ limit: '10' })).toBeUndefined();
        expect(parsePagination({ page: '2' })).toBeUndefined();
    });

    it('parses valid limit and page values', () => {
        expect(parsePagination({ limit: '25', page: '3' })).toEqual({
            limit: 25,
            page: 3
        });
    });

    it('falls back to default values for invalid limit or page', () => {
        expect(parsePagination({ limit: '999', page: '-2' })).toEqual({
            limit: 10,
            page: 1
        });
    });
});
