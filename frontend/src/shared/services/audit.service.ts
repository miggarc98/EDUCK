import { apiClient } from '@/shared/api/client';
import { AuditLogItem } from '../types/audit';

export const auditService = {
  getLogs: async (module?: string, objectId?: string): Promise<AuditLogItem[]> => {
    const params: Record<string, string> = {};
    if (module) params.module = module;
    if (objectId) params.object_id = objectId;

    const response = await apiClient.get<AuditLogItem[]>('/core/audit-logs/', { params });
    return response.data;
  },

  restoreSnapshot: async (auditLogId: number): Promise<{ detail: string; audit_log_id: number }> => {
    const response = await apiClient.post<{ detail: string; audit_log_id: number }>(
      `/core/audit-logs/${auditLogId}/restore/`
    );
    return response.data;
  },
};
