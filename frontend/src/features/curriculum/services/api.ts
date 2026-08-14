import { apiClient } from '@/shared/api/client';
import type { Course, CreateCoursePayload, Teacher } from '../types';

export interface PaginatedCourses {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
}

export const curriculumApi = {
  getCourses: async (): Promise<Course[]> => {
    // Note: Django API has pagination or returns list. Let's handle both.
    const response = await apiClient.get<PaginatedCourses | Course[]>('/curriculum/courses/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },

  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const response = await apiClient.post<Course>('/curriculum/courses/', payload);
    return response.data;
  },

  updateCourse: async (id: number, payload: Partial<CreateCoursePayload>): Promise<Course> => {
    const response = await apiClient.patch<Course>(`/curriculum/courses/${id}/`, payload);
    return response.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/curriculum/courses/${id}/`);
  },

  getTeachers: async (): Promise<Teacher[]> => {
    // Fetch users with role 'teacher'
    const response = await apiClient.get<{ results: Teacher[] }>('/auth/users/', {
      params: { role: 'teacher', page_size: 100 }
    });
    return response.data.results;
  }
};
