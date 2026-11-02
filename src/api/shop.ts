import { useQuery } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { Product } from '../types';
import { resolveLocalizedText } from '../utils/localization';
import { getProductImageUrl } from '../constants/images';

export interface CatalogQuery {
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
}

export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;
  const id = raw.id || raw._id || '';
  const title = resolveLocalizedText(raw.title || raw.name, 'Sacred Samagri Item');
  const shortDescription = resolveLocalizedText(raw.shortDescription || raw.subtitle, '');
  const description = resolveLocalizedText(
    raw.description,
    shortDescription || 'Consecrated pure Vedic samagri item.'
  );
  const category = resolveLocalizedText(raw.category, 'Puja Samagri');
  const priceMinor =
    typeof raw.priceMinor === 'number'
      ? raw.priceMinor
      : typeof raw.price?.amount === 'number'
      ? Math.round(raw.price.amount * 100)
      : typeof raw.price === 'number'
      ? Math.round(raw.price * 100)
      : 49900;

  return {
    ...raw,
    id,
    title,
    shortDescription,
    description,
    category,
    priceMinor,
    rating: raw.ratingAverage ?? raw.rating ?? 5.0,
    reviewCount: raw.reviewCount ?? 42,
    imageUrl: getProductImageUrl(raw),
    images:
      Array.isArray(raw.images) && raw.images.length > 0
        ? raw.images
        : Array.isArray(raw.media) && raw.media.length > 0
        ? raw.media.map((m: any) => m.url || m)
        : [getProductImageUrl(raw)],
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    inStock: raw.inStock ?? true,
    isPurityCertified: raw.isPurityCertified ?? true,
  };
}

export function useCatalog(query: CatalogQuery = {}) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: async () => {
      const list = await apiFetchList<any>('/products', {
        query: { limit: query.limit || 24, ...query },
      });
      return Array.isArray(list) ? list.map(normalizeProduct) : [];
    },
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    enabled: Boolean(idOrSlug),
    queryFn: async () => {
      const raw = await apiFetch<any>(`/products/${encodeURIComponent(idOrSlug)}`);
      return normalizeProduct(raw);
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const list = await apiFetchList<any>('/categories');
      return Array.isArray(list)
        ? list.map((c) => ({
            id: c.id || c._id || '',
            name: resolveLocalizedText(c.name || c.title, 'Samagri Category'),
            slug: c.slug || '',
          }))
        : [];
    },
  });
}
