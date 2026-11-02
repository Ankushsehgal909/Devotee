import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { Booking, Order, FamilyMember, PanchangInfo, User } from '../types';
import { resolveLocalizedText } from '../utils/localization';

export function normalizeBooking(raw: any): Booking {
  if (!raw) return raw;
  const id = raw.id || raw._id || '';
  const serviceName = resolveLocalizedText(
    raw.serviceName || raw.serviceNameSnapshot || raw.serviceNameLocalizedSnapshot,
    'Sacred Vedic Puja'
  );
  return {
    ...raw,
    id,
    serviceName,
  };
}

export function normalizePanchang(raw: any): PanchangInfo {
  if (!raw) return raw;
  return {
    ...raw,
    tithi: resolveLocalizedText(raw.tithi, 'Shukla Ashtami'),
    nakshatra: resolveLocalizedText(raw.nakshatra, 'Rohini'),
    paksha: raw.paksha === 'Krishna' ? 'Krishna' : 'Shukla',
    abhijitMuhurat: resolveLocalizedText(raw.abhijitMuhurat, '11:45 AM - 12:30 PM'),
    rahuKaalam: resolveLocalizedText(raw.rahuKaalam || raw.rahuKaal, '04:15 PM - 05:35 PM'),
  };
}

export function useDevoteeAccount() {
  return useQuery({
    queryKey: ['devotee-me'],
    queryFn: async () => {
      const user = await apiFetch<User>('/me');
      if (user && typeof user.name !== 'string') {
        user.name = resolveLocalizedText(user.name, 'Devotee');
      }
      return user;
    },
  });
}

export function useBookings(query: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['devotee-bookings', query],
    queryFn: async () => {
      const list = await apiFetchList<any>('/bookings', {
        query: { page: query.page || 1, limit: query.limit || 10, ...query },
      });
      return Array.isArray(list) ? list.map(normalizeBooking) : [];
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['devotee-booking', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const raw = await apiFetch<any>(`/bookings/${id}`);
      return normalizeBooking(raw);
    },
  });
}

export function useOrders(query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['devotee-orders', query],
    queryFn: () =>
      apiFetchList<Order>('/orders', {
        query: { page: query.page || 1, limit: query.limit || 10 },
      }),
  });
}

export function useFamilyMembers() {
  return useQuery({
    queryKey: ['family-members'],
    queryFn: () => apiFetchList<FamilyMember>('/me/family-members'),
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (member: Omit<FamilyMember, 'id' | 'userId'>) =>
      apiFetch<FamilyMember>('/me/family-members', {
        method: 'POST',
        body: member,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
    },
  });
}

export function usePanchang(date?: string) {
  return useQuery({
    queryKey: ['panchang', date || 'today'],
    queryFn: async () => {
      const raw = await apiFetch<any>('/panchang/today', {
        query: date ? { date } : undefined,
      });
      return normalizePanchang(raw);
    },
  });
}
