export interface LevelScales {
  preescolar?: string;
  primaria?: string;
  secundaria?: string;
  media?: string;
  [key: string]: string | undefined;
}

export interface OfferedDegrees {
  preescolar?: string[];
  primaria?: string[];
  secundaria?: string[];
  media?: string[];
  [key: string]: string[] | undefined;
}

export interface InstitutionNotificationSettings {
  behavior_alerts?: boolean;
  system_notices?: boolean;
  weekly_report?: boolean;
  [key: string]: boolean | undefined;
}

export interface InstitutionSettingData {
  id?: number;
  institution_name?: string;
  dane_nit: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  logo_url: string;
  is_formal_education?: boolean;

  academic_year: string;
  active_period: string;
  start_time: string;
  end_time: string;
  block_duration_minutes: number;
  default_teacher_max_hours?: number;
  shifts?: { id: string; name: string; start_time: string; end_time: string }[];

  general_scale: string;
  decimal_precision: number;
  min_passing_grade: number;
  independent_scale_per_level: boolean;
  level_scales: LevelScales;

  offered_degrees: OfferedDegrees;
  settings_json?: {
    notifications?: InstitutionNotificationSettings;
    roles_permissions?: Record<string, string[]>;
    [key: string]: any;
  };

  created_at?: string;
  updated_at?: string;
}
