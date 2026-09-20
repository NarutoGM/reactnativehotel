import { Platform } from 'react-native';

/**
 * Configuración única y centralizada del Backend de Aura Hotel.
 * - Emulador Android: 10.0.2.2 mapea a localhost de la PC de desarrollo.
 * - Dispositivos físicos / Web / iOS: localhost o la IP de red local (ej: 192.168.18.90).
 */
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export interface HttpResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Petición HTTP GET reutilizable
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<HttpResponse<T>> {
    try {
      let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      if (params) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query.append(key, String(val));
          }
        });
        const qs = query.toString();
        if (qs) {
          url += `?${qs}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Error en la solicitud HTTP (${response.status})`,
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: `No se pudo conectar con el servidor (${this.baseUrl}). Verifica que el backend esté activo.`,
      };
    }
  }

  /**
   * Petición HTTP POST JSON reutilizable
   */
  async post<T>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Error en la solicitud HTTP (${response.status})`,
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: `No se pudo conectar con el servidor (${this.baseUrl}).`,
      };
    }
  }

  /**
   * Petición HTTP POST FormData (para subida de archivos / vouchers)
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<HttpResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al subir el archivo.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: `Error al subir el archivo al backend (${this.baseUrl}).`,
      };
    }
  }

  /**
   * Petición HTTP PATCH reutilizable
   */
  async patch<T>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Error en la solicitud HTTP (${response.status})`,
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: `Error de conexión con el backend (${this.baseUrl}).`,
      };
    }
  }

  /**
   * Petición HTTP DELETE reutilizable
   */
  async delete<T>(endpoint: string): Promise<HttpResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Error en la solicitud HTTP (${response.status})`,
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: `Error de conexión con el backend (${this.baseUrl}).`,
      };
    }
  }
}

// Instancia única exportada para toda la aplicación
export const httpClient = new HttpClient(API_BASE_URL);
