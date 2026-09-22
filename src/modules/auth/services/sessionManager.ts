import { User } from '@/modules/auth/api/auth.api';

const AUTH_USER_KEY = '@aura_hotel_current_user';

let inMemoryUser: User | null = null;

const getAsyncStorage = () => {
  try {
    const storage = require('@react-native-async-storage/async-storage');
    return storage.default || storage;
  } catch {
    return null;
  }
};

export const sessionManager = {
  /**
   * Guarda el usuario logueado en almacenamiento persistente local
   */
  async saveUser(user: User): Promise<void> {
    inMemoryUser = user;
    try {
      const storage = getAsyncStorage();
      if (storage) {
        await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.warn('[SessionManager] Fallback a memoria temporal:', e);
    }
  },

  /**
   * Obtiene el usuario guardado localmente si existe
   */
  async getUser(): Promise<User | null> {
    try {
      const storage = getAsyncStorage();
      if (storage) {
        const data = await storage.getItem(AUTH_USER_KEY);
        if (data) return JSON.parse(data) as User;
      }
      return inMemoryUser;
    } catch (e) {
      return inMemoryUser;
    }
  },

  /**
   * Elimina la sesión persistida (Cerrar sesión)
   */
  async clearUser(): Promise<void> {
    inMemoryUser = null;
    try {
      const storage = getAsyncStorage();
      if (storage) {
        await storage.removeItem(AUTH_USER_KEY);
      }
    } catch (e) {
      console.warn('[SessionManager] Error limpiando sesión:', e);
    }
  },
};
