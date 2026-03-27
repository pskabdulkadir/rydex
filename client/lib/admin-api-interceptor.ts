/**
 * Admin API Interceptor
 * Otomatik Authorization header ekleme ve token refresh
 */

import { getAdminToken, refreshAdminToken, isTokenExpiringSoon } from './admin-auth';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

/**
 * Admin API fetch wrapper
 * Otomatik token management ile birlikte
 */
export async function adminApiCall<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

  // Auth header'ını ekle (skipAuth false ise)
  if (!skipAuth) {
    // Token'ın refresh edilmesi gerekiyorsa refresh et
    if (!skipRefresh && isTokenExpiringSoon()) {
      const refreshed = await refreshAdminToken();
      if (!refreshed) {
        throw new Error('Token yenileme başarısız. Lütfen tekrar giriş yapın.');
      }
    }

    const token = getAdminToken();
    if (!token) {
      throw new Error('Kimlik doğrulaması gereklidir');
    }

    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token.token}`
    };
  }

  // Content-Type header'ını ayarla (body varsa)
  if (fetchOptions.body && !fetchOptions.headers?.['Content-Type']) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Content-Type': 'application/json'
    };
  }

  try {
    const response = await fetch(url, fetchOptions);

    // 401 hatası alınırsa token refresh dene
    if (response.status === 401 && !skipRefresh && !skipAuth) {
      console.log('401 hatası - Token yenileme deneniyor...');
      const refreshed = await refreshAdminToken();

      if (refreshed) {
        // Token yenilendiyse isteği tekrar yap
        return adminApiCall<T>(url, { ...options, skipRefresh: true });
      } else {
        throw new Error('Token yenileme başarısız');
      }
    }

    // 4xx veya 5xx hatalarında
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API çağrısı hatası:', error);
    throw error;
  }
}

/**
 * GET isteği
 */
export function adminApiGet<T = any>(url: string, options: RequestOptions = {}) {
  return adminApiCall<T>(url, { ...options, method: 'GET' });
}

/**
 * POST isteği
 */
export function adminApiPost<T = any>(
  url: string,
  body?: any,
  options: RequestOptions = {}
) {
  return adminApiCall<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined
  });
}

/**
 * PUT isteği
 */
export function adminApiPut<T = any>(
  url: string,
  body?: any,
  options: RequestOptions = {}
) {
  return adminApiCall<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined
  });
}

/**
 * DELETE isteği
 */
export function adminApiDelete<T = any>(url: string, options: RequestOptions = {}) {
  return adminApiCall<T>(url, {
    ...options,
    method: 'DELETE'
  });
}
