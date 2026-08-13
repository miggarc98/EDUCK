import { apiClient } from '@/shared/api/client';
import type { User } from '@/features/auth_users/types';

export interface PaginatedUsers {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}

export const platformAdminApi = {
    getUsers: async (
        page = 1,
        filters?: { name?: string; email?: string; role?: string; status?: string }
    ): Promise<PaginatedUsers> => {
        let url = `/auth/users/?page=${page}`;
        if (filters) {
            if (filters.name) url += `&name=${encodeURIComponent(filters.name)}`;
            if (filters.email) url += `&email=${encodeURIComponent(filters.email)}`;
            if (filters.role) url += `&role=${encodeURIComponent(filters.role)}`;
            if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
        }
        const response = await apiClient.get(url);
        return response.data;
    },

    updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.patch(`/auth/users/${userId}/`, data);
        return response.data;
    },
};
