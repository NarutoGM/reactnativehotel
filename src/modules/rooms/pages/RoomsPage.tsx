import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../auth/api/auth.api';
import { roomsApi, Room } from '../api/rooms.api';
import { RoomCard } from '../components/RoomCard';
import { DateFilterBar } from '../components/DateFilterBar';
import { BookingModals } from '../components/BookingModals';

interface RoomsPageProps {
  currentUser: User;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ currentUser }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [capacity, setCapacity] = useState('2');
  const [checkIn, setCheckIn] = useState('2026-09-20');
  const [checkOut, setCheckOut] = useState('2026-09-23');

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
        bookingId: bData?.id ? `AG-${bData.id.slice(0, 6).toUpperCase()}` : 'AG-78921',
        roomTitle: selectedRoom.title,
        totalAmount: total,
      });
      fetchRooms();
    } else {
      Alert.alert('Error', res.error || 'No se pudo realizar la reserva.');
    }
  };

  return (
    <View style={styles.container}>
      <DateFilterBar
        checkIn={checkIn}
        checkOut={checkOut}
        capacity={capacity}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        onCapacityChange={setCapacity}
        onSearch={() => fetchRooms()}
      />

      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.resultsTitle}>
            Habitaciones Disponibles ({rooms.length})
          </Text>
          <Text style={styles.resultsSubtitle}>Para {capacity} personas</Text>
        </View>

        {roomsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={styles.loadingText}>Buscando disponibilidad...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bed-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No se encontraron habitaciones</Text>
            <Text style={styles.emptyDesc}>
              Prueba cambiando las fechas o reduciendo la cantidad de huéspedes.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <RoomCard room={item} onBook={(r) => setSelectedRoom(r)} />
            )}
          />
        )}
      </View>

      <BookingModals
        selectedRoom={selectedRoom}
        checkIn={checkIn}
        checkOut={checkOut}
        capacity={capacity}
        bookingLoading={bookingLoading}
        bookingSuccessModal={bookingSuccessModal}
        onCloseBooking={() => setSelectedRoom(null)}
        onConfirmBooking={handleBookRoom}
        onCloseSuccess={() => setBookingSuccessModal(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  resultsSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
    gap: 14,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptyDesc: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});
