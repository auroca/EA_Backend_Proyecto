import { describe, expect, it } from 'vitest';

import { parseFilters } from '../src/library/Filters';

describe('parseFilters', () => {
    it('returns an empty filter for missing or invalid filters', () => {
        expect(parseFilters(undefined, [{ name: 'name', type: 'string' }])).toEqual({
            filter: {},
            errors: []
        });

        expect(parseFilters('bad-filter', [{ name: 'name', type: 'string' }])).toEqual({
            filter: {},
            errors: []
        });
    });

    it('reports fields that are not allowed', () => {
        expect(parseFilters({ unknown: 'value' }, [{ name: 'name', type: 'string' }])).toEqual({
            filter: {},
            errors: ['field not allowed: unknown']
        });
    });

    it('parses numeric and boolean filters', () => {
        const result = parseFilters(
            {
                rating: ['4', '5'],
                active: 'true'
            },
            [
                { name: 'rating', type: 'number' },
                { name: 'active', type: 'boolean' }
            ]
        );

        expect(result).toEqual({
            filter: {
                $and: [{ rating: { $in: [4, 5] } }, { active: true }]
            },
            errors: []
        });
    });

    it('escapes string filters before creating regex conditions', () => {
        const result = parseFilters({ name: 'a.b' }, [{ name: 'name', type: 'string' }]);

        expect(result.errors).toEqual([]);
        expect(result.filter.name.$regex).toBeInstanceOf(RegExp);
        expect(result.filter.name.$regex.test('a.b')).toBe(true);
        expect(result.filter.name.$regex.test('acb')).toBe(false);
    });

    it('collects validation errors without adding invalid values to the filter', () => {
        const result = parseFilters({ rating: ['bad', '3'] }, [{ name: 'rating', type: 'number' }]);

        expect(result).toEqual({
            filter: { rating: 3 },
            errors: ['invalid number for rating: bad']
        });
    });
});
