import { apiClient } from '@/shared/api/client';
import type { Teacher, CreateTeacherPayload, ClassSchedule, CreateClassSchedulePayload } from '../types';

export interface PaginatedTeachers {
  count: number;
  next: string | null;
  previous: string | null;
  results: Teacher[];
}

export interface PaginatedSchedules {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassSchedule[];
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
  },

  // Schedules API
  getSchedules: async (params?: { course?: number; teacher?: number; day?: string }): Promise<ClassSchedule[]> => {
    const response = await apiClient.get<PaginatedSchedules | ClassSchedule[]>('/academics/schedules/', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },

  createSchedule: async (payload: CreateClassSchedulePayload): Promise<ClassSchedule> => {
    const response = await apiClient.post<ClassSchedule>('/academics/schedules/', payload);
    return response.data;
  },

  updateSchedule: async (id: number, payload: Partial<CreateClassSchedulePayload>): Promise<ClassSchedule> => {
    const response = await apiClient.patch<ClassSchedule>(`/academics/schedules/${id}/`, payload);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/academics/schedules/${id}/`);
  },

  generateSchedules: async (payload: { courses?: number[]; overwrite?: boolean }): Promise<any> => {
    const response = await apiClient.post('/academics/schedules/generate/', payload, { timeout: 0 });
    return response.data;
  }
};
