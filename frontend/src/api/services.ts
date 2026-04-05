import { apiClient } from './client';

export const authService = {
  login: async (formData: FormData) => {
    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const inventoryService = {
  search: async (query?: string, store_id?: number) => {
    const response = await apiClient.get('/inventory/search', {
      params: { query, store_id },
    });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/inventory/${id}`);
    return response.data;
  },
  addBatch: async (batchData: any) => {
    const response = await apiClient.post('/inventory/batch', batchData);
    return response.data;
  },
  updateBatchStock: async (batchId: number, quantity: number) => {
    const response = await apiClient.patch(`/inventory/batch/${batchId}`, null, {
        params: { quantity }
    });
    return response.data;
  },
};

export const salesService = {
  create: async (saleData: any) => {
    const response = await apiClient.post('/sales/create', saleData);
    return response.data;
  },
  getDailySummary: async (storeId: number) => {
    const response = await apiClient.get('/sales/daily-summary', {
      params: { store_id: storeId },
    });
    return response.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/sales');
    return response.data;
  },
};

export const analyticsService = {
  getSalesTrends: async () => {
    const response = await apiClient.get('/analytics/sales-trends');
    return response.data;
  },
  getStockHealth: async () => {
    const response = await apiClient.get('/analytics/stock-health');
    return response.data;
  },
  getDistrictSummary: async (days: number) => {
    const response = await apiClient.get(`/analytics/district-summary?days=${days}`);
    return response.data;
  },
};

export const aiService = {
  query: async (query: string, store_id?: number) => {
    const response = await apiClient.post('/ai/query', { query, store_id });
    return response.data;
  },
  applyReorder: async (inventoryId: number, quantity: number) => {
    const response = await apiClient.post('/ai/apply-reorder', { inventory_id: inventoryId, quantity });
    return response.data;
  },
};

export const prescriptionService = {
  getList: async (status: string = "pending") => {
    const response = await apiClient.get('/prescriptions', { params: { status } });
    return response.data;
  },
  create: async (rxData: any) => {
    const response = await apiClient.post('/prescriptions', rxData);
    return response.data;
  },
  validate: async (id: number, pharmacistId: number) => {
    const response = await apiClient.patch(`/prescriptions/${id}/validate`, null, { params: { pharmacist_id: pharmacistId } });
    return response.data;
  },
  reject: async (id: number) => {
    const response = await apiClient.patch(`/prescriptions/${id}/reject`);
    return response.data;
  }
};

export const storesService = {
  getAll: async () => {
    const response = await apiClient.get('/stores');
    return response.data;
  },
  create: async (storeData: any) => {
    const response = await apiClient.post('/stores', storeData);
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/stores/stats');
    return response.data;
  }
};
