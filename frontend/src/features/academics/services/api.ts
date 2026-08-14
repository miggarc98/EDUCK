import { apiClient } from '@/shared/api/client';
import type { Teacher, CreateTeacherPayload } from '../types';

export interface PaginatedTeachers {
  count: number;
  next: string | null;
  previous: string | null;
  results: Teacher[];
}

export const academicsApi = {
  getTeachers: async (params?: { search?: string; area?: string; status?: string }): Promise<Teacher[]> => {
    const response = await apiClient.get<PaginatedTeachers | Teacher[]>('/academics/teachers/', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },

  createTeacher: async (payload: CreateTeacherPayload): Promise<Teacher> => {
    const response = await apiClient.post<Teacher>('/academics/teachers/', payload);
    return response.data;
  },

  updateTeacher: async (id: number, payload: Partial<CreateTeacherPayload>): Promise<Teacher> => {
    const response = await apiClient.patch<Teacher>(`/academics/teachers/${id}/`, payload);
    return response.data;
  },

  deleteTeacher: async (id: number): Promise<void> => {
    await apiClient.delete(`/academics/teachers/${id}/`);
  }
};
