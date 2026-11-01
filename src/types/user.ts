export type UserRole = 'customer' | 'admin' | 'provider';

export interface DevoteeGotraSankalp {
  gotra?: string;
  nakshatra?: string;
  rashi?: string;
  kuldevi?: string;
  kuldevta?: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'undisclosed';
  preferredLanguage?: 'en' | 'hi' | 'sa';
  gotra?: string;
  nakshatra?: string;
  rashi?: string;
  walletBalanceMinor?: number; // In minor units (paise)
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string; // 'self' | 'spouse' | 'son' | 'daughter' | 'father' | 'mother' etc.
  gotra?: string;
  nakshatra?: string;
  rashi?: string;
  dateOfBirth?: string;
  birthTime?: string;
  birthPlace?: string;
  notes?: string;
  isSankalpHead?: boolean;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: 'Home' | 'Office' | 'Ancestral House' | 'Other';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  isDefault: boolean;
  contactName?: string;
  contactPhone?: string;
}
