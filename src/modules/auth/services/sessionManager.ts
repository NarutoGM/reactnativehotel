import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/modules/auth/api/auth.api';

const AUTH_USER_KEY = '@aura_hotel_current_user';

export const sessionManager = {
  /**
   * Guarda el usuario logueado en almacenamiento persistente local
   */
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('[SessionManager] Error guardando sesión:', e);
    }
  },

  /**
   * Obtiene el usuario guardado localmente si existe
   */
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (!data) return null;
      return JSON.parse(data) as User;
    } catch (e) {
      console.error('[SessionManager] Error leyendo sesión:', e);
      return null;
    }
  },

  /**
   * Elimina la sesión persistida (Cerrar sesión)
   */
  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.error('[SessionManager] Error eliminando sesión:', e);
    }
  },
};
