import { API_BASE_URL } from './auth.service';

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

export const roomsService = {
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

  async createBooking(payload: BookingPayload): Promise<{ success: boolean; booking?: any; error?: string }> {
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
};
