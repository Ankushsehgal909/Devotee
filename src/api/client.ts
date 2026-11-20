import { ENV } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';
import { refreshAccessTokenApi } from './auth';

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly errors?: string[],
    readonly code?: string,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${cleanPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Single entry point for talking to the NestJS API.
 * Unwraps the `ApiResponse` envelope so callers get plain data, and turns failures into `ApiError`.
 * Modeled directly from VedSarthi apps/web/src/lib/api-client.ts.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const url = buildUrl(path, query);
  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const payload: any = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      const isAuthEndpoint = path.startsWith('/auth/');
      const { refreshToken, setSession, user } = useAuthStore.getState();

      if (!isAuthEndpoint && refreshToken && user) {
        try {
          const refreshed = await refreshAccessTokenApi(refreshToken);
          if (refreshed?.accessToken) {
            await setSession({
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken || refreshToken,
              user,
            });

            // Retry original request with newly refreshed token
            requestHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
            const retryResponse = await fetch(url, {
              ...rest,
              headers: requestHeaders,
              body:
                body !== undefined
                  ? body instanceof FormData
                    ? body
                    : JSON.stringify(body)
                  : undefined,
            });

            if (retryResponse.ok) {
              const retryPayload: any = await retryResponse.json().catch(() => null);
              return retryPayload &&
                typeof retryPayload === 'object' &&
                'data' in retryPayload
                ? retryPayload.data
                : retryPayload;
            }
          }
        } catch {
          // Token refresh attempt failed; retain local session
        }
      }

      // Note: We do NOT automatically call logout() on background 401 errors.
      // Auto-logout erases the devotee's saved session from storage upon app reload.
      // Devotees remain signed in locally and can explicitly log out when they choose to.
    }

    const message =
      payload?.errors?.length
        ? payload.errors.join(', ')
        : Array.isArray(payload?.message)
        ? payload.message.join(', ')
        : payload?.message || response.statusText || 'Request failed';

    throw new ApiError(
      payload?.statusCode ?? response.status,
      message,
      payload?.errors,
      payload?.code,
      payload?.details
    );
  }

  // Unpack ApiResponse envelope if present, else return raw payload
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

/** Same as `apiFetch`, but handles list responses */
export async function apiFetchList<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T[]> {
  const data = await apiFetch<T[] | { items: T[] } | { data: T[] }>(path, options);
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    if ('items' in data && Array.isArray((data as any).items)) {
      return (data as any).items;
    }
    if ('data' in data && Array.isArray((data as any).data)) {
      return (data as any).data;
    }
  }
  return [];
}
