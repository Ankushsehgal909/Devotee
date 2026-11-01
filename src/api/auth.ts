import { apiFetch } from './client';
import { AuthSession, User } from '../types';

export interface RequestOtpPayload {
  identifier: string; // Phone number or email
  purpose?: 'login' | 'register';
  channel?: 'sms' | 'whatsapp' | 'email';
}

export interface RequestOtpResult {
  otpId: string;
  channel: 'sms' | 'whatsapp' | 'email';
  expiresInSeconds?: number;
  message?: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  code: string;
}

export async function requestOtpApi(payload: RequestOtpPayload): Promise<RequestOtpResult> {
  return apiFetch<RequestOtpResult>('/auth/otp/request', {
    method: 'POST',
    body: {
      identifier: payload.identifier,
      purpose: payload.purpose || 'login',
      channel: payload.channel || 'sms',
    },
  });
}

export async function verifyOtpApi(payload: VerifyOtpPayload): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/otp/verify', {
    method: 'POST',
    body: payload,
  });
}

export async function updateProfileApi(profile: Partial<User>): Promise<User> {
  return apiFetch<User>('/me', {
    method: 'PATCH',
    body: profile,
  });
}
