import type { Teacher } from '@/features/curriculum/types';
export type { Teacher };

export interface CreateTeacherPayload {
  email: string;
  first_name: string;
  last_name: string;
  area?: string;
  load?: number;
  status?: 'active' | 'on_leave';
  password?: string;
  availability?: Record<string, { start_time: string; end_time: string }>;
}

export interface ClassSchedule {
  id: number;
  course: number;
  course_name: string;
  day: string;
  time_slot: string;
  subject: number;
  subject_name: string;
  teacher: number;
  teacher_name: string;
  room: string;
}

export interface CreateClassSchedulePayload {
  course: number;
  day: string;
  time_slot: string;
  subject: number;
  teacher: number;
  room: string;
}
