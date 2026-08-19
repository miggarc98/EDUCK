import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const dashboardApi = axios.create({
  baseURL: API_URL,
});

dashboardApi.interceptors.request.use((config) => {
  return config;
});

export const getDashboardSummary = async () => {
  try {
    const response = await dashboardApi.get('/analytics/dashboard/summary/');
    return response.data;
  } catch (error) {
    console.warn("API falló (probablemente falta de auth/token). Usando datos mock para UI.");
    return {
      students: { total_active: 854 },
      teachers: { total_active: 42 },
      behavior: { open_cases: 12, cases_this_month: 28 },
      academics: { active_classes: 156 }
    };
  }
};
