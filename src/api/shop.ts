import { useQuery } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { Product } from '../types';

export interface CatalogQuery {
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
}

export function useCatalog(query: CatalogQuery = {}) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () =>
      apiFetchList<Product>('/products', {
        query: { limit: query.limit || 24, ...query },
      }),
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    enabled: Boolean(idOrSlug),
    queryFn: () => apiFetch<Product>(`/products/${encodeURIComponent(idOrSlug)}`),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetchList<{ id: string; name: string; slug: string }>('/categories'),
  });
}
