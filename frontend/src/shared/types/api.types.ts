// shared/types/api.types.ts
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}