import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchList } from './client';
import { Booking, Order, FamilyMember, PanchangInfo, User } from '../types';
import { resolveLocalizedText } from '../utils/localization';
import { siteImages } from '../constants/images';

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface SupportThread {
  id: string;
  title: string;
  topic: string;
  status: 'open' | 'closed' | 'pending';
  lastMessageAt?: string;
  createdAt: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderType: 'customer' | 'admin' | 'system';
  content: string;
  createdAt: string;
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: 'customer' | 'pandit' | 'system';
  content: string;
  createdAt: string;
}

export interface PanditSearchResult {
  id: string;
  name: string;
  shakha?: string;
  avatarUrl?: string;
  rating: number;
  experienceYears: number;
  city: string;
  languages: string[];
  isVerified: boolean;
  completedCeremoniesCount?: number;
  lineage?: string;
  biography?: string;
}

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
    status: raw.status || 'confirmed',
    bookingNumber: raw.bookingNumber || `VED-${id.slice(-6).toUpperCase()}`,
    serviceImage:
      raw.serviceImage ||
      raw.imageUrl ||
      raw.media?.[0]?.url ||
      siteImages.homeAssetsVerticalsHomePujas,
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; gotra?: string; email?: string }) =>
      apiFetch<User>('/me', {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotee-me'] });
    },
  });
}

export function useBookings(query: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ['devotee-bookings', query],
    queryFn: async () => {
      const list = await apiFetchList<any>('/bookings', {
        query: { page: query.page || 1, limit: query.limit || 20, ...query },
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

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      apiFetch<any>('/bookings', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotee-bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      apiFetch<any>(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: { reason: reason || 'Devotee schedule change' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotee-bookings'] });
    },
  });
}

export function useAttendanceCode(bookingId: string) {
  return useQuery({
    queryKey: ['attendance-code', bookingId],
    enabled: Boolean(bookingId),
    queryFn: () =>
      apiFetch<{ code?: string; attendanceCode?: string }>(
        `/bookings/${bookingId}/attendance-code`
      ),
  });
}

export function useBookingMessages(bookingId: string) {
  return useQuery({
    queryKey: ['booking-messages', bookingId],
    enabled: Boolean(bookingId),
    refetchInterval: 5000,
    queryFn: () =>
      apiFetchList<BookingMessage>(`/bookings/${bookingId}/messages`),
  });
}

export function useSendBookingMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, content }: { bookingId: string; content: string }) =>
      apiFetch<BookingMessage>(`/bookings/${bookingId}/messages`, {
        method: 'POST',
        body: { content },
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['booking-messages', vars.bookingId] });
    },
  });
}

export function useOrders(query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['devotee-orders', query],
    queryFn: () =>
      apiFetchList<Order>('/orders', {
        query: { page: query.page || 1, limit: query.limit || 20 },
      }),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['devotee-order', orderId],
    enabled: Boolean(orderId),
    queryFn: () => apiFetch<Order>(`/orders/${orderId}`),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      apiFetch<Order>('/orders', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotee-orders'] });
    },
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

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<FamilyMember> & { id: string }) =>
      apiFetch<FamilyMember>(`/me/family-members/${id}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
    },
  });
}

export function useDeleteFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/me/family-members/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
    },
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => apiFetchList<UserAddress>('/me/addresses'),
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (address: Omit<UserAddress, 'id'>) =>
      apiFetch<UserAddress>('/me/addresses', {
        method: 'POST',
        body: address,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      apiFetch<void>(`/me/addresses/${addressId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
}

export function useProviders(query: { city?: string; language?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['providers', query],
    queryFn: async () => {
      const list = await apiFetchList<any>('/providers', {
        query: { limit: query.limit || 20, ...query },
      });
      return Array.isArray(list)
        ? list.map((p) => ({
            id: p.id || p._id || '',
            name: resolveLocalizedText(p.name, 'Acharya Shastri'),
            shakha: p.shakha || 'Vedic Tradition',
            avatarUrl:
              p.avatarUrl ||
              p.profilePhoto ||
              siteImages.homeAssetsVerticalsGurukulAcharyas,
            rating: p.ratingAverage ?? p.rating ?? 4.9,
            experienceYears: p.experienceYears || 12,
            city: p.city || p.locationCity || 'Kashi (Varanasi)',
            languages: Array.isArray(p.languages) ? p.languages : ['Hindi', 'Sanskrit'],
            isVerified: true,
            lineage: p.lineage || 'Shukla Yajurveda Madhyandina Shakha',
            biography: resolveLocalizedText(p.bio || p.biography, 'Certified Gurukul Acharya with Vedic mastery.'),
          }))
        : [];
    },
  });
}

export function useProvider(idOrSlug: string) {
  return useQuery({
    queryKey: ['provider', idOrSlug],
    enabled: Boolean(idOrSlug),
    queryFn: async () => {
      const p = await apiFetch<any>(`/providers/${encodeURIComponent(idOrSlug)}`);
      return {
        id: p.id || p._id || '',
        name: resolveLocalizedText(p.name, 'Acharya Shastri'),
        shakha: p.shakha || 'Vedic Tradition',
        avatarUrl:
          p.avatarUrl ||
          p.profilePhoto ||
          siteImages.homeAssetsVerticalsGurukulAcharyas,
        rating: p.ratingAverage ?? p.rating ?? 4.9,
        experienceYears: p.experienceYears || 12,
        city: p.city || p.locationCity || 'Kashi (Varanasi)',
        languages: Array.isArray(p.languages) ? p.languages : ['Hindi', 'Sanskrit'],
        isVerified: true,
        lineage: p.lineage || 'Shukla Yajurveda Madhyandina Shakha',
        biography: resolveLocalizedText(p.bio || p.biography, 'Certified Gurukul Acharya with Vedic mastery.'),
      };
    },
  });
}

export function useSupportThreads() {
  return useQuery({
    queryKey: ['support-threads'],
    queryFn: () => apiFetchList<SupportThread>('/support/threads'),
  });
}

export function useCreateSupportThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; topic: string; message: string }) =>
      apiFetch<SupportThread>('/support/threads', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-threads'] });
    },
  });
}

export function useSupportThread(threadId: string) {
  return useQuery({
    queryKey: ['support-thread', threadId],
    enabled: Boolean(threadId),
    refetchInterval: 5000,
    queryFn: () => apiFetch<SupportThread>(`/support/threads/${threadId}`),
  });
}

export function useSendSupportMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      apiFetch<SupportMessage>(`/support/threads/${threadId}/messages`, {
        method: 'POST',
        body: { content },
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['support-thread', vars.threadId] });
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
