import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import {
  IProduct,
  ISchool,
  ICategory,
  ISetting,
  IOrder,
  IInquiry,
  IAdmin,
  StatsResponse,
  PaginatedResponse,
} from '@indraprasth/shared';

// Public Hooks
export const usePublicSettings = () =>
  useQuery<ISetting>({
    queryKey: ['settings', 'public'],
    queryFn: async () => {
      const res = await api.get('/settings/public');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useSchools = () =>
  useQuery<(ISchool & { productCount?: number })[]>({
    queryKey: ['schools', 'public'],
    queryFn: async () => {
      const res = await api.get('/schools');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCategories = () =>
  useQuery<(ICategory & { productCount?: number })[]>({
    queryKey: ['categories', 'public'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useFeaturedProducts = () =>
  useQuery<IProduct[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await api.get('/products/featured');
      return res.data.data;
    },
  });

export const useProducts = (params: Record<string, any>) =>
  useQuery<PaginatedResponse<IProduct>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/products', { params });
      return res.data.data;
    },
  });

export const useProduct = (slug: string) =>
  useQuery<IProduct & { related?: IProduct[] }>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

export const useTrackOrder = (orderNumber: string, phone: string, enabled = false) =>
  useQuery<IOrder>({
    queryKey: ['order', 'track', orderNumber, phone],
    queryFn: async () => {
      const res = await api.get('/orders/track', {
        params: { orderNumber, phone },
      });
      return res.data.data;
    },
    enabled: enabled && !!orderNumber && !!phone,
    retry: false,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/orders', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useCreateInquiry = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/inquiries', payload);
      return res.data;
    },
  });
};

// Admin Hooks
export const useAdminStats = () =>
  useQuery<StatsResponse>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
  });

export const useAdminProducts = (params: Record<string, any>) =>
  useQuery<PaginatedResponse<IProduct>>({
    queryKey: ['admin', 'products', params],
    queryFn: async () => {
      const res = await api.get('/admin/products', { params });
      return res.data.data;
    },
  });

export const useAdminProduct = (id: string) =>
  useQuery<IProduct>({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const res = await api.get(`/admin/products/${id}`);
      return res.data.data;
    },
    enabled: !!id && id !== 'new',
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/admin/products/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useAdminSchools = () =>
  useQuery<(ISchool & { productCount?: number })[]>({
    queryKey: ['admin', 'schools'],
    queryFn: async () => {
      const res = await api.get('/admin/schools');
      return res.data.data;
    },
  });

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/schools', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/admin/schools/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/schools/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
};

export const useAdminCategories = () =>
  useQuery<(ICategory & { productCount?: number })[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories');
      return res.data.data;
    },
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/categories', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/admin/categories/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useAdminOrders = (params: Record<string, any>) =>
  useQuery<PaginatedResponse<IOrder>>({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const res = await api.get('/admin/orders', { params });
      return res.data.data;
    },
  });

export const useAdminOrder = (id: string) =>
  useQuery<IOrder>({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const res = await api.patch(`/admin/orders/${id}/status`, { status, note });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useAdminInquiries = (params: Record<string, any>) =>
  useQuery<PaginatedResponse<IInquiry>>({
    queryKey: ['admin', 'inquiries', params],
    queryFn: async () => {
      const res = await api.get('/admin/inquiries', { params });
      return res.data.data;
    },
  });

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/admin/inquiries/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
    },
  });
};

export const useAdminSettings = () =>
  useQuery<ISetting>({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings');
      return res.data.data;
    },
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/admin/settings', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'public'] });
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data as { url: string; publicId: string };
    },
  });
};

export const useUploadVideo = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      const res = await api.post('/admin/uploads/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data as { url: string; publicId: string };
    },
  });
};

export const useImportProductsCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/admin/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useAdminStaff = () =>
  useQuery<IAdmin[]>({
    queryKey: ['admin', 'staff'],
    queryFn: async () => {
      const res = await api.get('/admin/staff');
      return res.data.data;
    },
  });

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string; role?: 'owner' | 'staff' }) => {
      const res = await api.post('/admin/staff', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
  });
};

export const useToggleStaffStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/admin/staff/${id}/status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/staff/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
  });
};

export * from './browse';

