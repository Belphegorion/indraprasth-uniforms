import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from './client';
import { IBrowseData, ISchool } from '@indraprasth/shared';

export interface BrowseParams {
  school?: string;
  q?: string;
  gender?: string | string[];
  season?: string | string[];
  typeGroup?: string | string[];
  itemType?: string | string[];
  size?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const useBrowseProducts = (params: BrowseParams) =>
  useQuery<IBrowseData>({
    queryKey: ['products', 'browse', params],
    queryFn: async () => {
      const cleanParams: Record<string, any> = {};
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== '') {
          if (Array.isArray(val)) {
            if (val.length > 0) {
              cleanParams[key] = val;
            }
          } else {
            cleanParams[key] = val;
          }
        }
      }
      const res = await api.get('/products/browse', { params: cleanParams });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useBrowseSchools = (params?: { withCounts?: boolean; [key: string]: any }) =>
  useQuery<(ISchool & { productCount?: number })[]>({
    queryKey: ['schools', 'browse', params],
    queryFn: async () => {
      const res = await api.get('/schools', {
        params: { withCounts: true, ...params },
      });
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
