export interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
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
}

export interface CreateCoursePayload {
  name: string;
  level: string;
  degree?: string;
  director?: number | null;
}
