import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export interface Room {
  id: string;
  roomNumber: string;
  title: string;
  type: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  bedType: string;
  surfaceAreaM2: number;
  rating?: number;
  reviewsCount?: number;
  imageUrl?: string | null;
}

export interface Booking {
  id: string;
  bookingId: string;
  roomId: string;
  userId?: string | null;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  totalAmount: number;
  voucherFileName?: string | null;
  createdAt: string;
  room?: Room;
}

export interface SearchRoomsParams {
  capacity?: number;
  checkIn?: string;
  checkOut?: string;
}

export interface BookingPayload {
  roomId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalAmount: number;
}

export const roomsApi = {
  async searchRooms(params: SearchRoomsParams): Promise<{ success: boolean; rooms: Room[]; error?: string }> {
    try {
      const query = new URLSearchParams();
      if (params.capacity) query.append('capacity', params.capacity.toString());
      if (params.checkIn) query.append('checkIn', params.checkIn);
      if (params.checkOut) query.append('checkOut', params.checkOut);

      const url = `${API_BASE_URL}/rooms?${query.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, rooms: [], error: data.message || 'Error al buscar habitaciones.' };
      }

      return { success: true, rooms: Array.isArray(data) ? data : [] };
    } catch (err: any) {
      return {
        success: false,
        rooms: [],
        error: `No se pudo conectar con el servidor (${API_BASE_URL}).`,
      };
    }
  },

  async getRoomById(id: string): Promise<{ success: boolean; room?: Room; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${id}`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Error al obtener datos de la habitación.' };
      }
      return { success: true, room: data };
    } catch (err: any) {
      return { success: false, error: `Error de conexión (${API_BASE_URL}).` };
    }
  },

  async createBooking(payload: BookingPayload): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Error al procesar la reserva.' };
      }

      return { success: true, booking: data };
    } catch (err: any) {
      return { success: false, error: `Error de conexión con el backend (${API_BASE_URL}).` };
    }
  },

  async getBookings(userId?: string): Promise<{ success: boolean; bookings: Booking[]; error?: string }> {
    try {
      const url = userId
        ? `${API_BASE_URL}/rooms/bookings/all?userId=${userId}`
        : `${API_BASE_URL}/rooms/bookings/all`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, bookings: [], error: data.message || 'Error al obtener reservas.' };
      }

      return { success: true, bookings: Array.isArray(data) ? data : [] };
    } catch (err: any) {
      return { success: false, bookings: [], error: `Error de conexión (${API_BASE_URL}).` };
    }
  },

  async uploadVoucher(bookingId: string, imageUri: string): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    try {
      const filename = imageUri.split('/').pop() || 'voucher.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/rooms/bookings/${bookingId}/voucher`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Error al subir el voucher.' };
      }

      return { success: true, booking: data };
    } catch (err: any) {
      return { success: false, error: `Error al conectar y subir el voucher (${API_BASE_URL}).` };
    }
  },
};
