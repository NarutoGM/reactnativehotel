import { httpClient } from '@/arquitectura/httpClient';
import { Room } from '@/modules/rooms/api/rooms.api';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

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
  status: BookingStatus;
  totalAmount: number;
  voucherFileName?: string | null;
  voucherSubmitted?: boolean;
  createdAt: string;
  room?: Room;
  user?: {
    id: string;
    fullName: string;
    email: string;
    documentNumber?: string;
    phone?: string;
    avatarUrl?: string | null;
  } | null;
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

export const bookingsApi = {
  async createBooking(payload: BookingPayload): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const res = await httpClient.post<Booking>('/rooms/book', payload);
    return {
      success: res.success,
      booking: res.data,
      error: res.error,
    };
  },

  async getBookings(userId?: string): Promise<{ success: boolean; bookings: Booking[]; error?: string }> {
    const res = await httpClient.get<Booking[]>('/rooms/bookings/all', { userId });
    return {
      success: res.success,
      bookings: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  },

  async uploadVoucher(bookingId: string, imageUri: string): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const filename = imageUri.split('/').pop() || 'voucher.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const res = await httpClient.postFormData<Booking>(`/rooms/bookings/${bookingId}/voucher`, formData);
    return {
      success: res.success,
      booking: res.data,
      error: res.error,
    };
  },

  async deleteVoucher(bookingId: string, index: number): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const res = await httpClient.delete<Booking>(`/rooms/bookings/${bookingId}/voucher?index=${index}`);
    return {
      success: res.success,
      booking: res.data,
      error: res.error,
    };
  },

  async submitVouchers(bookingId: string): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const res = await httpClient.post<Booking>(`/rooms/bookings/${bookingId}/submit-voucher`, {});
    return {
      success: res.success,
      booking: res.data,
      error: res.error,
    };
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const res = await httpClient.patch<Booking>(`/rooms/bookings/${bookingId}/status`, { status });
    return {
      success: res.success,
      booking: res.data,
      error: res.error,
    };
  },
};
