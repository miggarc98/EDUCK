export interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  name?: string;
  employee_id?: string;
  area?: string;
  load?: number;
  status?: 'active' | 'on_leave';
  availability?: Record<string, { start_time: string; end_time: string }>;
  additional_areas?: string[];
  max_hours?: number;
  available_shifts?: string[];
}

export interface Course {
  id: number;
  name: string;
  level: string;
  degree?: string;
  director?: number | null;
  director_detail?: Teacher | null;
  is_active: boolean;
  
  // Temporary fields hardcoded on backend & displayed on frontend
  students: number;
  avgGrade: string;
  attendance: string;
  subjects_count?: number;
}

export interface CreateCoursePayload {
  name: string;
  level: string;
  degree?: string;
  director?: number | null;
}

export interface Area {
  id: number;
  name: string;
  description?: string;
  is_mandatory?: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: number;
  name: string;
  description?: string;
  area: number;
  area_detail?: Area;
  courses: number[];
  courses_detail?: { id: number; name: string }[];
  weekly_hours?: number;
  weekly_hours_overrides?: Record<string, number>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

