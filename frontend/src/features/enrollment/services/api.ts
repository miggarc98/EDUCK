import { apiClient } from '@/shared/api/client';
import type { Student, PaginatedStudents } from '../types';

export const enrollmentApi = {
  getStudents: async (params?: { search?: string; course?: number; degree?: string; email?: string; name?: string; page?: number; page_size?: number }): Promise<{ results: Student[]; count: number }> => {
    const response = await apiClient.get<PaginatedStudents | Student[]>('/enrollment/students/', { params });
    if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length };
    }
    return { results: response.data.results, count: response.data.count };
  },

  getStudent: async (id: number): Promise<Student> => {
    const response = await apiClient.get<Student>(`/enrollment/students/${id}/`);
    return response.data;
  },

  updateStudentProfile: async (id: number, data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.patch<Student>(`/enrollment/students/${id}/`, data);
    return response.data;
  }
};
