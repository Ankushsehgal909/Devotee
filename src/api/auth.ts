import { apiFetch } from './client';
import {
  AuthSession,
  User,
  RequestOtpInput,
  RequestOtpResult,
  VerifyOtpInput,
  PasswordLoginInput,
  RegisterInput,
  ResetPasswordInput,
  ResetPasswordTokenResult,
} from '../types';

/** Accept common Indian mobile formats while preserving explicit international numbers or emails. */
export function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  const phone = trimmed.replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(phone)) return `+91${phone}`;
  if (/^0\d{10}$/.test(phone)) return `+91${phone.slice(1)}`;
  if (/^91\d{10}$/.test(phone)) return `+${phone}`;
  return phone;
}

/** Request an OTP code via SMS, WhatsApp, or Email */
export async function requestOtpApi(payload: RequestOtpInput): Promise<RequestOtpResult> {
  const contact = normalizeIdentifier(payload.identifier);
  return apiFetch<RequestOtpResult>('/auth/otp/request', {
    method: 'POST',
    body: {
      identifier: contact,
      purpose: payload.purpose || 'login',
      ...(payload.channel ? { channel: payload.channel } : {}),
    },
  });
}

/** Verify a 6-digit OTP code tied to an otpId */
export async function verifyOtpApi(
  payload: VerifyOtpInput
): Promise<AuthSession | ResetPasswordTokenResult> {
  return apiFetch<AuthSession | ResetPasswordTokenResult>('/auth/otp/verify', {
    method: 'POST',
    body: {
      otpId: payload.otpId,
      code: payload.code.trim(),
    },
  });
}

/** Resend the OTP code for an active OTP challenge */
export async function resendOtpApi(payload: { otpId: string }): Promise<RequestOtpResult> {
  return apiFetch<RequestOtpResult>('/auth/otp/resend', {
    method: 'POST',
    body: payload,
  });
}

/** Sign in with Email / Phone and Password */
export async function loginWithPasswordApi(payload: PasswordLoginInput): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: {
      identifier: normalizeIdentifier(payload.identifier),
      password: payload.password,
    },
  });
}

/** Register a new Devotee account */
export async function registerCustomerApi(
  payload: RegisterInput
): Promise<{ user: User; otp: RequestOtpResult }> {
  const normalizedPhone = normalizeIdentifier(payload.phone);
  const normalizedEmail = payload.email ? normalizeIdentifier(payload.email) : undefined;

  return apiFetch<{ user: User; otp: RequestOtpResult }>('/auth/register', {
    method: 'POST',
    body: {
      name: payload.name.trim(),
      phone: normalizedPhone,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(payload.password ? { password: payload.password } : {}),
      acceptedTermsAt: payload.acceptedTermsAt || new Date().toISOString(),
      marketingConsent: payload.marketingConsent ?? false,
      preferredLanguage: payload.preferredLanguage || 'en',
      ...(payload.otpChannel ? { otpChannel: payload.otpChannel } : {}),
    },
  });
}

/** Reset password using the verified resetToken */
export async function resetPasswordApi(
  payload: ResetPasswordInput
): Promise<{ success: boolean; message?: string }> {
  return apiFetch<{ success: boolean; message?: string }>('/auth/password/reset', {
    method: 'POST',
    body: {
      resetToken: payload.resetToken,
      newPassword: payload.newPassword,
    },
  });
}

/** Fetch authenticated devotee account profile */
export async function getMeApi(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

/** Update devotee profile details */
export async function updateProfileApi(profile: Partial<User>): Promise<User> {
  return apiFetch<User>('/me', {
    method: 'PATCH',
    body: profile,
  });
}
