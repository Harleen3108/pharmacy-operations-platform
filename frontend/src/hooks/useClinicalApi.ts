import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, salesService, analyticsService, aiService } from '../api/services';

export const useInventory = (query?: string) => {
  return useQuery({
    queryKey: ['inventory', query],
    queryFn: () => inventoryService.search(query),
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
};

export const useSales = (storeId: number) => {
  const queryClient = useQueryClient();
  
  const summary = useQuery({
    queryKey: ['sales-summary', storeId],
    queryFn: () => salesService.getDailySummary(storeId),
  });

  const checkout = useMutation({
    mutationFn: (saleData: any) => salesService.create(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['sales-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sales-trends'] });
    },
  });

  return { summary, checkout };
};

export const useAnalytics = () => {
  const trends = useQuery({
    queryKey: ['sales-trends'],
    queryFn: () => analyticsService.getSalesTrends(),
  });

  const health = useQuery({
    queryKey: ['stock-health'],
    queryFn: () => analyticsService.getStockHealth(),
  });

  return { trends, health };
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
