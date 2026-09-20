import { Platform } from 'react-native';

// En emulador Android: 10.0.2.2 apunta al localhost del PC.
// En dispositivo Android físico conectado por Wi-Fi: 192.168.18.90
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export interface User {
  id: string;
  email: string;
  fullName: string;
  documentNumber: string;
  role: 'ADMIN' | 'RECEPTIONIST' | 'GUEST';
  createdAt?: number | string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  documentNumber: string;
  role?: 'ADMIN' | 'RECEPTIONIST' | 'GUEST';
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al iniciar sesión. Verifica tus credenciales.',
        };
      }

      return { success: true, user: data };
    } catch (err: any) {
      return {
        success: false,
        error: `No se pudo conectar con el servidor (${API_BASE_URL}). Asegúrate de que el backend esté corriendo.`,
      };
    }
  },

  async register(payload: RegisterPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          role: payload.role || 'GUEST',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al registrar la cuenta.',
        };
      }

      return { success: true, user: data };
    } catch (err: any) {
      return {
        success: false,
        error: `No se pudo conectar con el servidor (${API_BASE_URL}). Asegúrate de que el backend esté corriendo.`,
      };
    }
  },
};
