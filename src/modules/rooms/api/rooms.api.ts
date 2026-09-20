import { httpClient } from '@/arquitectura/httpClient';

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

export interface CreateRoomPayload {
  id?: string;
  roomNumber: string;
  title: string;
  type: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  isAvailable?: boolean;
  bedType?: string;
  surfaceAreaM2?: number;
  imageUrl?: string;
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  title?: string;
  type?: string;
  floor?: number;
  capacity?: number;
  pricePerNight?: number;
  isAvailable?: boolean;
  bedType?: string;
  surfaceAreaM2?: number;
  imageUrl?: string;
}

export const roomsApi = {
  async searchRooms(params: SearchRoomsParams): Promise<{ success: boolean; rooms: Room[]; error?: string }> {
    const res = await httpClient.get<Room[]>('/rooms', {
      capacity: params.capacity,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
    });

    return {
      success: res.success,
      rooms: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  },

  async getAllRoomsForAdmin(): Promise<{ success: boolean; rooms: Room[]; error?: string }> {
    const res = await httpClient.get<Room[]>('/rooms/admin/all');
    return {
      success: res.success,
      rooms: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  },

  async getRoomById(id: string): Promise<{ success: boolean; room?: Room; error?: string }> {
    const res = await httpClient.get<Room>(`/rooms/${id}`);
    return {
      success: res.success,
      room: res.data,
      error: res.error,
    };
  },

  async createRoom(payload: CreateRoomPayload): Promise<{ success: boolean; room?: Room; error?: string }> {
    const res = await httpClient.post<Room>('/rooms', payload);
    return {
      success: res.success,
      room: res.data,
      error: res.error,
    };
  },

  async toggleRoomAvailability(id: string, isAvailable?: boolean): Promise<{ success: boolean; room?: Room; error?: string }> {
    const res = await httpClient.patch<Room>(`/rooms/${id}/toggle`, isAvailable !== undefined ? { isAvailable } : {});
    return {
      success: res.success,
      room: res.data,
      error: res.error,
    };
  },

  async updateRoom(id: string, payload: UpdateRoomPayload): Promise<{ success: boolean; room?: Room; error?: string }> {
    const res = await httpClient.patch<Room>(`/rooms/${id}`, payload);
    return {
      success: res.success,
      room: res.data,
      error: res.error,
    };
  },

  async uploadRoomImage(roomId: string, imageUri: string): Promise<{ success: boolean; room?: Room; error?: string }> {
    const filename = imageUri.split('/').pop() || 'room.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const res = await httpClient.postFormData<Room>(`/rooms/${roomId}/image`, formData);
    return {
      success: res.success,
      room: res.data,
      error: res.error,
    };
  },

  async deleteRoom(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await httpClient.delete(`/rooms/${id}`);
    return {
      success: res.success,
      error: res.error,
    };
  },

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
};
