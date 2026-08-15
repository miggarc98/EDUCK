import { apiClient } from '@/shared/api/client';
import type { Course, CreateCoursePayload, Teacher, Area, Subject } from '../types';

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
  },

  getAreas: async (): Promise<Area[]> => {
    const response = await apiClient.get<Area[] | { results: Area[] }>('/curriculum/areas/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },

  createArea: async (payload: Partial<Area>): Promise<Area> => {
    const response = await apiClient.post<Area>('/curriculum/areas/', payload);
    return response.data;
  },

  updateArea: async (id: number, payload: Partial<Area>): Promise<Area> => {
    const response = await apiClient.patch<Area>(`/curriculum/areas/${id}/`, payload);
    return response.data;
  },

  deleteArea: async (id: number): Promise<void> => {
    await apiClient.delete(`/curriculum/areas/${id}/`);
  },

  seedLey115: async (): Promise<{ areas_created: number; subjects_created: number; status: string }> => {
    const response = await apiClient.post('/curriculum/areas/seed_ley115/');
    return response.data;
  },


  getSubjects: async (params?: { area?: number; course?: number }): Promise<Subject[]> => {
    const response = await apiClient.get<Subject[] | { results: Subject[] }>('/curriculum/subjects/', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },

  createSubject: async (payload: Partial<Subject>): Promise<Subject> => {
    const response = await apiClient.post<Subject>('/curriculum/subjects/', payload);
    return response.data;
  },

  updateSubject: async (id: number, payload: Partial<Subject>): Promise<Subject> => {
    const response = await apiClient.patch<Subject>(`/curriculum/subjects/${id}/`, payload);
    return response.data;
  },

  deleteSubject: async (id: number): Promise<void> => {
    await apiClient.delete(`/curriculum/subjects/${id}/`);
  }
};

