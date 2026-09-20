import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../auth/api/auth.api';
import { roomsApi, Room } from '../api/rooms.api';
import { RoomCard } from '../components/RoomCard';
import { DateFilterBar } from '../components/DateFilterBar';
import { BookingModals } from '../components/BookingModals';
import { RoomDetailModal } from '../components/RoomDetailModal';

interface RoomsPageProps {
  currentUser: User;
  onNavigateToBookings?: () => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ currentUser, onNavigateToBookings }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [capacity, setCapacity] = useState('2');
  const [checkIn, setCheckIn] = useState('2026-09-20');
  const [checkOut, setCheckOut] = useState('2026-09-23');

  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<any | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (targetCapacity = capacity, inDate = checkIn, outDate = checkOut) => {
    setRoomsLoading(true);
    const parsedCap = parseInt(targetCapacity, 10) || 1;
    const res = await roomsApi.searchRooms({
      capacity: parsedCap,
      checkIn: inDate,
      checkOut: outDate,
    });
    setRoomsLoading(false);
    if (res.success) {
      setRooms(res.rooms);
    }
  };

  const handleBookRoom = async () => {
    if (!selectedRoom) return;
    setBookingLoading(true);

    const dIn = new Date(checkIn);
    const dOut = new Date(checkOut);
    const diffDays = Math.max(1, Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
    const total = diffDays * selectedRoom.pricePerNight;

    const res = await roomsApi.createBooking({
      roomId: selectedRoom.id,
      userId: currentUser?.id,
      guestName: currentUser?.fullName || 'Huésped Registrado',
      guestEmail: currentUser?.email || 'huesped@aurahotel.pe',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestsCount: parseInt(capacity, 10) || 2,
      totalAmount: total,
    });

    setBookingLoading(false);

    if (res.success) {
      const bData = res.booking;
      setSelectedRoom(null);
      setBookingSuccessModal({
        bookingId: bData?.bookingId || (bData?.id ? `AG-${bData.id.slice(0, 6).toUpperCase()}` : 'AG-78921'),
        roomTitle: selectedRoom.title,
        totalAmount: total,
      });
      fetchRooms();
    } else {
      Alert.alert('Error', res.error || 'No se pudo realizar la reserva.');
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <DateFilterBar
        checkIn={checkIn}
        checkOut={checkOut}
        capacity={capacity}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        onCapacityChange={setCapacity}
        onSearch={() => fetchRooms()}
      />

      <View className="flex-1 px-3.5">
        <View className="flex-row justify-between items-center mb-2.5">
          <Text className="text-slate-900 text-[16px] font-black">
            Habitaciones Disponibles ({rooms.length})
          </Text>
          <Text className="text-slate-500 text-[12px] font-medium">
            Para {capacity} personas
          </Text>
        </View>

        {roomsLoading ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="text-slate-500 mt-2.5 text-[13px] font-medium">
              Buscando disponibilidad en Aura Hotel...
            </Text>
          </View>
        ) : rooms.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8 py-10">
            <Ionicons name="bed-outline" size={44} color="#94A3B8" />
            <Text className="text-slate-900 text-[16px] font-bold mt-2.5">
              No se encontraron habitaciones
            </Text>
            <Text className="text-slate-500 text-center text-[12px] mt-1">
              Prueba cambiando las fechas o reduciendo la cantidad de huéspedes.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-6"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <RoomCard
                room={item}
                onPress={(r) => setDetailRoom(r)}
                onBook={(r) => setSelectedRoom(r)}
              />
            )}
          />
        )}
      </View>

      {/* MODAL DETALLES COMPLETOS DE HABITACIÓN */}
      <RoomDetailModal
        room={detailRoom}
        onClose={() => setDetailRoom(null)}
        onBook={(r) => setSelectedRoom(r)}
      />

      {/* MODAL CONFIRMACIÓN DE RESERVA Y COMPROBANTE */}
      <BookingModals
        selectedRoom={selectedRoom}
        checkIn={checkIn}
        checkOut={checkOut}
        capacity={capacity}
        bookingLoading={bookingLoading}
        bookingSuccessModal={bookingSuccessModal}
        onCloseBooking={() => setSelectedRoom(null)}
        onConfirmBooking={handleBookRoom}
        onCloseSuccess={() => {
          setBookingSuccessModal(null);
          if (onNavigateToBookings) onNavigateToBookings();
        }}
      />
    </View>
  );
};
