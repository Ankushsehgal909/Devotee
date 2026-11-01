import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { Booking, Order, FamilyMember, PanchangInfo, User } from '../types';

export function useDevoteeAccount() {
  return useQuery({
    queryKey: ['devotee-me'],
    queryFn: () => apiFetch<User>('/me'),
  });
}

export function useBookings(query: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['devotee-bookings', query],
    queryFn: () =>
      apiFetchList<Booking>('/bookings', {
        query: { page: query.page || 1, limit: query.limit || 10, ...query },
      }),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['devotee-booking', id],
    enabled: Boolean(id),
    queryFn: () => apiFetch<Booking>(`/bookings/${id}`),
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
    queryFn: () =>
      apiFetch<PanchangInfo>('/panchang/today', {
        query: date ? { date } : undefined,
      }),
  });
}
