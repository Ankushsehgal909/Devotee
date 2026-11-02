import { User } from './user';

export type OtpChannel = 'sms' | 'whatsapp' | 'email';
export type OtpPurpose = 'register' | 'login' | 'verify_email' | 'verify_phone' | 'reset_password';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  tokens?: AuthTokens;
  expiresAt?: number;
  user: User;
}

export interface RequestOtpInput {
  identifier: string;
  channel?: OtpChannel;
  purpose?: OtpPurpose;
}

export interface RequestOtpResult {
  otpId: string;
  channel: OtpChannel;
  sentTo?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  attemptsRemaining?: number;
  message?: string;
}

export interface VerifyOtpInput {
  otpId: string;
  code: string;
}

export interface PasswordLoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  acceptedTermsAt: string;
  marketingConsent?: boolean;
  preferredLanguage?: 'en' | 'hi';
  otpChannel?: OtpChannel;
}

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordTokenResult {
  resetToken: string;
}

