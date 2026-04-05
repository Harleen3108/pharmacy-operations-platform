import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, salesService, analyticsService, aiService, storesService, prescriptionService } from '../api/services';

export const useInventory = (query?: string, storeId?: number) => {
  return useQuery({
    queryKey: ['inventory', query, storeId],
    queryFn: () => inventoryService.search(query, storeId),
  });
};

export const useProduct = (id: number, storeId?: number) => {
  return useQuery({
    queryKey: ['product', id, storeId],
    queryFn: () => inventoryService.getById(id), // Note: Backend update for getById with storeId could be added later if needed
    enabled: !!id,
  });
};

export const useSales = (storeId: number) => {
  const queryClient = useQueryClient();
  
  const summary = useQuery({
    queryKey: ['sales-summary', storeId],
    queryFn: () => salesService.getDailySummary(storeId),
  });

  const history = useQuery({
    queryKey: ['sales-history'],
    queryFn: () => salesService.getAll(),
  });

  const checkout = useMutation({
    mutationFn: (saleData: any) => salesService.create(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      queryClient.invalidateQueries({ queryKey: ['sales-trends'] });
    },
  });

  return { summary, history, checkout };
};

export const useAnalytics = (days: number = 1) => {
  const trends = useQuery({
    queryKey: ['sales-trends'],
    queryFn: () => analyticsService.getSalesTrends(),
  });

  const health = useQuery({
    queryKey: ['stock-health'],
    queryFn: () => analyticsService.getStockHealth(),
  });

  const districtSummary = useQuery({
    queryKey: ['district-summary', days],
    queryFn: () => analyticsService.getDistrictSummary(days),
  });

  return { trends, health, districtSummary };
};

export const useInventoryMutation = () => {
    const queryClient = useQueryClient();
    
    const addBatch = useMutation({
        mutationFn: (batchData: any) => inventoryService.addBatch(batchData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
        }
    });

    const updateStock = useMutation({
        mutationFn: ({ id, quantity }: { id: number, quantity: number }) => 
            inventoryService.updateBatchStock(id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            queryClient.invalidateQueries({ queryKey: ['stock-health'] });
        }
    });

    return { addBatch, updateStock };
};

export const useAI = () => {
  const queryClient = useQueryClient();
  
  const query = useMutation({
    mutationFn: (args: { query: string; storeId?: number }) => aiService.query(args.query, args.storeId),
  });

  const applyReorder = useMutation({
      mutationFn: ({ inventoryId, quantity }: { inventoryId: number, quantity: number }) => 
          aiService.applyReorder(inventoryId, quantity),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stock-health'] });
      }
  });

  return { query, applyReorder };
};

export const useStores = () => {
  const queryClient = useQueryClient();

  const stats = useQuery({
    queryKey: ['stores-stats'],
    queryFn: () => storesService.getStats(),
  });

  const createStore = useMutation({
    mutationFn: (storeData: any) => storesService.create(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores-stats'] });
    },
  });

  return { stats, createStore };
};

export const usePrescriptions = (status: string = "pending") => {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ['prescriptions', status],
    queryFn: () => prescriptionService.getList(status),
  });

  const validate = useMutation({
    mutationFn: ({ id, pharmacistId }: { id: number, pharmacistId: number }) => 
      prescriptionService.validate(id, pharmacistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const reject = useMutation({
    mutationFn: (id: number) => prescriptionService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  return { list, validate, reject };
};
