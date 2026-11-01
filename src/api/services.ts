import { useQuery } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { PujaService } from '../types';

export interface ServiceQuery {
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
}

export function useServices(query: ServiceQuery = {}) {
  return useQuery({
    queryKey: ['services', query],
    queryFn: () =>
      apiFetchList<PujaService>('/services', {
        query: { limit: query.limit || 20, ...query },
      }),
  });
}

export function useService(idOrSlug: string) {
  return useQuery({
    queryKey: ['service', idOrSlug],
    enabled: Boolean(idOrSlug),
    queryFn: () => apiFetch<PujaService>(`/services/${encodeURIComponent(idOrSlug)}`),
  });
}
