import { User } from './user';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

export interface RequestOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  cooldownSeconds: number;
}
