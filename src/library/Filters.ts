import mongoose from 'mongoose';

export type FieldType = 'string' | 'number' | 'boolean' | 'id' | 'stringArray';

export type FieldSpec = {
    name: string;
    type: FieldType;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toNumber = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const toBoolean = (v: any): boolean | null => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
        const lower = v.toLowerCase();
        if (lower === 'true') return true;
        if (lower === 'false') return false;
    }
    return null;
};

export const parseFilters = (
    queryFilter: any,
    allowedFields: FieldSpec[]
): { filter: any; errors: string[] } => {
    const errors: string[] = [];
    const conditions: any[] = [];

    if (!queryFilter || typeof queryFilter !== 'object') {
        return { filter: {}, errors };
    }

    const allowed = new Map(allowedFields.map((f) => [f.name, f]));

    for (const key of Object.keys(queryFilter)) {
        if (!allowed.has(key)) {
            errors.push(`field not allowed: ${key}`);
            continue;
        }

        const spec = allowed.get(key)!;
        const raw = queryFilter[key];
        const values = Array.isArray(raw) ? raw : [raw];

        if (spec.type === 'number') {
            const nums: number[] = [];
            for (const v of values) {
                const n = toNumber(v);
                if (n === null) {
                    errors.push(`invalid number for ${key}: ${v}`);
                } else {
                    nums.push(n);
                }
            }
            if (nums.length === 1) {
                conditions.push({ [key]: nums[0] });
            } else if (nums.length > 1) {
                conditions.push({ [key]: { $in: nums } });
            }
            continue;
        }

        if (spec.type === 'id') {
            const ids: string[] = [];
            for (const v of values) {
                if (typeof v !== 'string' || !mongoose.Types.ObjectId.isValid(v)) {
                    errors.push(`invalid id for ${key}: ${v}`);
                } else {
                    ids.push(v);
                }
            }
            if (ids.length === 1) {
                conditions.push({ [key]: ids[0] });
            } else if (ids.length > 1) {
                conditions.push({ [key]: { $in: ids } });
            }
            continue;
        }

        if (spec.type === 'boolean') {
            const bools: boolean[] = [];
            for (const v of values) {
                const b = toBoolean(v);
                if (b === null) {
                    errors.push(`invalid boolean for ${key}: ${v}`);
                } else {
                    bools.push(b);
                }
            }
            if (bools.length === 1) {
                conditions.push({ [key]: bools[0] });
            } else if (bools.length > 1) {
                conditions.push({ [key]: { $in: bools } });
            }
            continue;
        }

        if (spec.type === 'string') {
            // build regex(s)
            if (values.length === 1) {
                const v = String(values[0]);
                const regex = new RegExp(escapeRegex(v), 'i');
                conditions.push({ [key]: { $regex: regex } });
            } else {
                const ors = values.map((v) => ({ [key]: { $regex: new RegExp(escapeRegex(String(v)), 'i') } }));
                conditions.push({ $or: ors });
            }
            continue;
        }

        if (spec.type === 'stringArray') {
            // each value becomes an $elemMatch regex; multiple values -> OR
            if (values.length === 1) {
                const v = String(values[0]);
                conditions.push({ [key]: { $elemMatch: { $regex: escapeRegex(v), $options: 'i' } } });
            } else {
                const ors = values.map((v) => ({ [key]: { $elemMatch: { $regex: escapeRegex(String(v)), $options: 'i' } } }));
                conditions.push({ $or: ors });
            }
            continue;
        }
    }

    let filter: any = {};
    if (conditions.length === 1) {
        filter = conditions[0];
    } else if (conditions.length > 1) {
        filter = { $and: conditions };
    }

    return { filter, errors };
};

export default {
    parseFilters
};
