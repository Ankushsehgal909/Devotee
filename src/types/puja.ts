export type BookingMode = 'in_person' | 'online' | 'home_visit';

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'awaiting_payment'
  | 'confirmed'
  | 'rescheduled'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface PanditProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  shakha?: string; // Rigveda, Yajurveda, etc.
  lineage?: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  city: string;
  isVerified: boolean;
  completedCeremoniesCount: number;
}

export interface PujaService {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  significance?: string;
  durationMinutes: number;
  priceMinor: number; // In paise
  compareAtPriceMinor?: number;
  advanceDepositPercentage: number; // e.g. 25
  availableModes: BookingMode[];
  ritualsIncluded: string[];
  samagriProvidedByUs: string[];
  samagriDevoteeArranges: string[];
  imageUrl?: string;
  deity?: string;
  category: string;
  rating: number;
  reviewCount: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  mode: BookingMode;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  totalAmountMinor: number;
  advancePaidMinor: number;
  balanceDueMinor: number;
  attendanceCode?: string; // 6-digit verification code
  panditId?: string;
  pandit?: PanditProfile;
  sankalpGotra?: string;
  sankalpNames?: string[];
  sankalpSpecialMotive?: string;
  venueAddress?: string;
  onlineMeetingUrl?: string;
  prasadTrackingNumber?: string;
  createdAt: string;
}
