export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; statusCode?: number };

export type PaginatedResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type ListResult<T> = PaginatedResult<T> | T[];
