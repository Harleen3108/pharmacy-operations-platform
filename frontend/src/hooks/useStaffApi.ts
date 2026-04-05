import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const useStaff = () => {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/users`);
      return data;
    },
  });

  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/roles`);
      return data;
    },
  });

  const stores = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/stores`);
      return data;
    },
  });

  const createStaff = useMutation({
    mutationFn: async (staffData: any) => {
      const { data } = await axios.post(`${API_BASE_URL}/users`, staffData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await axios.patch(`${API_BASE_URL}/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  return { users, roles, stores, createStaff, updateStaff, deleteStaff };
};
