import { apiClient } from '@/shared/api/client';
import { InstitutionSettingData } from '../types';

export const institutionApi = {
  getSettings: async (): Promise<InstitutionSettingData> => {
    const response = await apiClient.get<InstitutionSettingData>('/institution/settings/');
    return response.data;
  },

  updateSettings: async (data: Partial<InstitutionSettingData>): Promise<InstitutionSettingData> => {
    const response = await apiClient.put<InstitutionSettingData>('/institution/settings/', data);
    return response.data;
  },

  patchSettings: async (data: Partial<InstitutionSettingData>): Promise<InstitutionSettingData> => {
    const response = await apiClient.patch<InstitutionSettingData>('/institution/settings/', data);
    return response.data;
  },
};
