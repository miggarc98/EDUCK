export interface AuditChangeDetail {
  old: any;
  new: any;
}

export interface AuditLogItem {
  id: number;
  content_type: number;
  object_id: string;
  user: number | null;
  user_name: string;
  user_email: string;
  user_role: string;
  ip_address: string | null;
  user_agent: string;
  action_type: 'CREATE' | 'UPDATE' | 'RESTORE' | 'DELETE';
  action_type_display: string;
  module: string;
  entity_name: string;
  changes: Record<string, AuditChangeDetail>;
  snapshot: Record<string, any>;
  created_at: string;
}
