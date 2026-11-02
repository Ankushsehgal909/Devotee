import { NavigatorScreenParams } from '@react-navigation/native';
import { PujaService } from './puja';
import { Product } from './store';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  // Global Modals / Sheets
  PujaDetailModal: { service: PujaService };
  ProductDetailModal: { product: Product };
  PanditChatModal: { bookingId: string; panditName: string };
  AttendanceCodeModal: { bookingId: string; code: string };
  LivePujaVideoModal: { bookingId: string; roomUrl?: string };
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    resetToken: string;
    identifier?: string;
  };
  VerifyOtp: {
    otpId: string;
    identifier: string;
    purpose?: 'login' | 'register' | 'reset_password' | 'verify_email';
    channel?: 'sms' | 'whatsapp' | 'email';
    resendAvailableAt?: string;
    phone?: string;
  };
  ProfileSetup: { phone: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  PujasTab: undefined;
  MalaTab: undefined;
  StoreTab: undefined;
  AccountTab: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PanchangDetail: undefined;
  LiveDarshan: undefined;
  FestivalCalendar: undefined;
  PanditsDirectory: undefined;
  NotificationCenter: undefined;
  UniversalSearch: undefined;
};

export type PujaStackParamList = {
  PujaCatalog: undefined;
  PujaDetail: { serviceId: string };
  MuhuratPicker: { serviceId: string };
  DevoteeSankalp: { serviceId: string };
  PujaCheckout: { serviceId: string };
  BookingConfirmation: { bookingId: string };
  MyBookings: undefined;
  BookingDetail: { bookingId: string };
};

export type StoreStackParamList = {
  StoreHome: undefined;
  ProductListing: { category?: string };
  ProductDetail: { productId: string };
  CartScreen: undefined;
  StoreCheckout: undefined;
  OrderConfirmation: { orderId: string };
  OrderHistory: undefined;
  DeliveryTracker: { orderId: string };
};

export type UtilitiesStackParamList = {
  JapamMala: undefined;
  AudioPlayer: undefined;
  KnowledgeHub: undefined;
  KundliCalculator: undefined;
  TempleLocator: undefined;
};

export type AccountStackParamList = {
  DevoteeDashboard: undefined;
  ProfileSettings: undefined;
  FamilyMembers: undefined;
  AddFamilyMember: { memberId?: string };
  PaymentLedger: undefined;
  WishlistScreen: undefined;
  SupportDesk: undefined;
  SavedAddresses: undefined;
  AppSettings: undefined;
};
