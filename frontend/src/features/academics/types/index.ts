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
}
