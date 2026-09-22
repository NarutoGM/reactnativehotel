import { httpClient } from '@/arquitectura/httpClient';

export interface User {
  id: string;
  email: string;
  fullName: string;
  documentNumber: string;
  phone?: string;
  avatarUrl?: string | null;
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
  phone?: string;
  role?: 'ADMIN' | 'RECEPTIONIST' | 'GUEST';
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  documentNumber?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await httpClient.post<User>('/auth/login', payload);
    return {
      success: res.success,
      user: res.data,
      error: res.error,
    };
  },

  async register(payload: RegisterPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await httpClient.post<User>('/auth/register', {
      ...payload,
      role: payload.role || 'GUEST',
    });
    return {
      success: res.success,
      user: res.data,
      error: res.error,
    };
  },

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await httpClient.patch<User>(`/auth/profile/${userId}`, payload);
    return {
      success: res.success,
      user: res.data,
      error: res.error,
    };
  },

  async uploadAvatar(userId: string, fileUri: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const filename = fileUri.split('/').pop() || `avatar_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const res = await httpClient.postFormData<User>(`/auth/profile/${userId}/avatar`, formData);
    return {
      success: res.success,
      user: res.data,
      error: res.error,
    };
  },

  async getAllUsers(): Promise<{ success: boolean; users?: User[]; error?: string }> {
    const res = await httpClient.get<User[]>('/auth/users');
    return {
      success: res.success,
      users: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  },

  async createUser(payload: RegisterPayload): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await httpClient.post<User>('/auth/register', {
      ...payload,
      role: payload.role || 'GUEST',
    });
    return {
      success: res.success,
      user: res.data,
      error: res.error,
    };
  },
};
