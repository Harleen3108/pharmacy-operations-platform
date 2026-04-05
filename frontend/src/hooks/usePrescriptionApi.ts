import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionService } from '../api/services';

export const usePrescriptions = (status: string = "pending") => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['prescriptions', status],
    queryFn: () => prescriptionService.getList(status),
  });

  const create = useMutation({
    mutationFn: (rxData: any) => prescriptionService.create(rxData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  const validate = useMutation({
    mutationFn: ({ id, pharmacistId }: { id: number; pharmacistId: number }) => 
      prescriptionService.validate(id, pharmacistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  const reject = useMutation({
    mutationFn: (id: number) => prescriptionService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  return { query, create, validate, reject };
};
