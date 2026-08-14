import { User } from '@/features/auth_users/types';
import { Course } from '@/features/curriculum/types';

export interface StudentProfile {
  phone?: string;
  address?: string;
  birth_date?: string;
  blood_type?: string;
  medical_notes?: string;
  guardian_name?: string;
  guardian_relation?: string;
  guardian_phone?: string;
  guardian_email?: string;
}

export interface StudentPerformance {
  gpa: number;
  attendance: number;
  lastPeriodRank: string;
}

export interface DisciplineCase {
  id: string;
  date: string;
  type: string;
  status: string;
}

export interface Student extends User {
  course_detail?: Course | null;
  profile?: StudentProfile | null;
  performance: StudentPerformance;
  disciplineCases: DisciplineCase[];
}
export interface PaginatedStudents {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}
