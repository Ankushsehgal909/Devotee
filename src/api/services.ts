import { useQuery } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { PujaService } from '../types';
import { resolveLocalizedText } from '../utils/localization';
import { getPujaImageUrl } from '../constants/images';

export interface ServiceQuery {
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
}

export function normalizeService(raw: any): PujaService {
  if (!raw) return raw;
  const id = raw.id || raw._id || '';
  const title = resolveLocalizedText(raw.title || raw.name, 'Sacred Vedic Puja');
  const subtitle = resolveLocalizedText(
    raw.subtitle || raw.shortDescription,
    resolveLocalizedText(raw.description, '').slice(0, 120)
  );
  const description = resolveLocalizedText(
    raw.description,
    subtitle || 'Authentic Vedic ceremony adhering to Shastric vidhis.'
  );
  const significance = resolveLocalizedText(raw.significance?.what || raw.significance, '');
  const category = resolveLocalizedText(raw.category, 'Vedic Ceremony');
  const priceMinor =
    typeof raw.priceMinor === 'number'
      ? raw.priceMinor
      : typeof raw.price?.amount === 'number'
      ? Math.round(raw.price.amount * 100)
      : typeof raw.price === 'number'
      ? Math.round(raw.price * 100)
      : 350000;

  return {
    ...raw,
    id,
    title,
    subtitle,
    description,
    significance,
    category,
    priceMinor,
    imageUrl: getPujaImageUrl(raw),
    rating: raw.ratingAverage ?? raw.rating ?? 4.9,
    reviewCount: raw.reviewCount ?? 108,
    durationMinutes: raw.durationMinutes || 120,
    availableModes: raw.availableModes || raw.mode || ['home_visit', 'online'],
    ritualsIncluded: Array.isArray(raw.ritualsIncluded)
      ? raw.ritualsIncluded.map((r: any) => resolveLocalizedText(r))
      : [
          'Ganesh Pujan and Swasti Vachan',
          'Kalash Sthapana and Navagraha Avahan',
          'Abhishek and Mool Mantra Chanting',
          'Sacred Hawan with 108 Ahutis',
          'Maha Mangal Aarti and Ashirvad',
        ],
    samagriProvidedByUs: Array.isArray(raw.samagriProvidedByUs)
      ? raw.samagriProvidedByUs.map((s: any) => resolveLocalizedText(s))
      : [
          'Pure Gir Cow A2 Ghee (500g)',
          'Certified Hawan Samagri with sacred herbs',
          'Navagraha Samidha sticks',
          'Roli, Akshat, Chandan, Janeu, Kalava',
        ],
    samagriDevoteeArranges: Array.isArray(raw.samagriDevoteeArranges)
      ? raw.samagriDevoteeArranges.map((s: any) => resolveLocalizedText(s))
      : [
          'Fresh flowers and Tulsi leaves',
          'Fresh fruits (5 varieties) and 5 Pan leaves',
          'Raw cow milk (250ml) and Gangajal',
        ],
  };
}

export function useServices(query: ServiceQuery = {}) {
  return useQuery({
    queryKey: ['services', query],
    queryFn: async () => {
      const list = await apiFetchList<any>('/services', {
        query: { limit: query.limit || 20, ...query },
      });
      return Array.isArray(list) ? list.map(normalizeService) : [];
    },
  });
}

export function useService(idOrSlug: string) {
  return useQuery({
    queryKey: ['service', idOrSlug],
    enabled: Boolean(idOrSlug),
    queryFn: async () => {
      const raw = await apiFetch<any>(`/services/${encodeURIComponent(idOrSlug)}`);
      return normalizeService(raw);
    },
  });
}
