import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../auth/api/auth.api';
import { roomsApi, Booking } from '../api/rooms.api';

interface BookingsPageProps {
  currentUser: User;
}

type BookingCategory = 'PENDING' | 'ACTIVE' | 'FINISHED';

export const BookingsPage: React.FC<BookingsPageProps> = ({ currentUser }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<BookingCategory>('PENDING');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const res = await roomsApi.getBookings(currentUser.role === 'GUEST' ? currentUser.id : undefined);
    setLoading(false);
    if (res.success) {
      setBookings(res.bookings);
    }
  };

  const handlePickAndUploadVoucher = async (booking: Booking) => {
    try {
      let ImagePicker: any;
      try {
        ImagePicker = await import('expo-image-picker');
      } catch (err) {
        Alert.alert(
          'Módulo de Cámara / Galería',
          'El módulo nativo se está vinculando. Si estás en emulador, ingresa el link del voucher o reinicia la app con expo run:android.'
        );
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso Denegado', 'Necesitamos acceso a la galería para seleccionar la captura del voucher.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        setUploadingId(booking.id);
        const res = await roomsApi.uploadVoucher(booking.id, uri);
        setUploadingId(null);

        if (res.success) {
          Alert.alert('¡Éxito!', 'La captura del voucher se ha subido correctamente a Firebase Storage.');
          loadBookings();
        } else {
          Alert.alert('Error al subir', res.error || 'No se pudo subir la imagen.');
        }
      }
    } catch (e: any) {
      setUploadingId(null);
      Alert.alert('Error', e.message || 'Ocurrió un error al seleccionar la imagen.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeCategory === 'PENDING') {
      return b.status === 'PENDING';
    }
    if (activeCategory === 'ACTIVE') {
      return b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
    }
    if (activeCategory === 'FINISHED') {
      return b.status === 'CHECKED_OUT' || b.status === 'CANCELLED' || b.status === 'REJECTED';
    }
    return true;
  });

  return (
    <View className="flex-1 bg-slate-100">
      {/* Category Tabs: Pendientes / Activas / Finalizadas */}
      <View className="flex-row bg-white p-2 mx-3.5 mt-3.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
        <TouchableOpacity
          className={`flex-1 py-2 items-center rounded-xl ${activeCategory === 'PENDING' ? 'bg-slate-900' : 'bg-slate-50'}`}
          onPress={() => setActiveCategory('PENDING')}
        >
          <Text className={`text-[12px] font-bold ${activeCategory === 'PENDING' ? 'text-white' : 'text-slate-600'}`}>
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 items-center rounded-xl ${activeCategory === 'ACTIVE' ? 'bg-slate-900' : 'bg-slate-50'}`}
          onPress={() => setActiveCategory('ACTIVE')}
        >
          <Text className={`text-[12px] font-bold ${activeCategory === 'ACTIVE' ? 'text-white' : 'text-slate-600'}`}>
            Activas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 items-center rounded-xl ${activeCategory === 'FINISHED' ? 'bg-slate-900' : 'bg-slate-50'}`}
          onPress={() => setActiveCategory('FINISHED')}
        >
          <Text className={`text-[12px] font-bold ${activeCategory === 'FINISHED' ? 'text-white' : 'text-slate-600'}`}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView className="flex-1 px-3.5 pt-3" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-16 justify-center items-center">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="text-slate-500 mt-2 text-[13px] font-medium">Cargando tus reservas...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View className="py-14 justify-center items-center px-6">
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text className="text-slate-900 text-[16px] font-bold mt-2.5">
              No hay reservas en esta categoría
            </Text>
            <Text className="text-slate-500 text-center text-[12px] mt-1">
              Las reservas realizadas se mostrarán aquí con su estado actual y comprobante.
            </Text>
          </View>
        ) : (
          filteredBookings.map((b) => {
            const isPending = b.status === 'PENDING';
            const hasVoucher = !!b.voucherFileName;

            return (
              <View
                key={b.id}
                className="bg-white rounded-2xl p-4 mb-3.5 border border-slate-200 shadow-sm"
              >
                {/* Header Card */}
                <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-100">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="bookmark" size={16} color="#0F172A" />
                    <Text className="text-slate-900 font-black text-[15px] tracking-wide">
                      {b.bookingId}
                    </Text>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-full border ${
                      b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
                        ? 'bg-emerald-50 border-emerald-200'
                        : b.status === 'PENDING'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black ${
                        b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
                          ? 'text-emerald-700'
                          : b.status === 'PENDING'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {b.status === 'PENDING'
                        ? 'PENDIENTE DE VOUCHER'
                        : b.status === 'CONFIRMED'
                        ? 'CONFIRMADA'
                        : b.status === 'CHECKED_IN'
                        ? 'EN ESTADÍA'
                        : b.status}
                    </Text>
                  </View>
                </View>

                {/* Room Info */}
                <View className="py-2.5">
                  <Text className="text-slate-900 font-black text-[16px]">
                    {b.room?.title || 'Habitación en Aura Grand Hotel'}
                  </Text>
                  <Text className="text-slate-500 text-[12px] font-semibold mt-0.5">
                    📅 {b.checkInDate} al {b.checkOutDate} · {b.nights} noche(s) · {b.guestsCount} huésped(es)
                  </Text>
                  <Text className="text-slate-900 font-black text-[16px] mt-1.5">
                    Total: S/ {b.totalAmount}
                  </Text>
                </View>

                {/* Voucher Section */}
                {hasVoucher ? (
                  <View className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Image
                        source={{ uri: b.voucherFileName! }}
                        className="w-12 h-12 rounded-lg bg-slate-200 border border-slate-300"
                        resizeMode="cover"
                      />
                      <View>
                        <Text className="text-slate-900 text-[12px] font-bold">Comprobante Adjunto</Text>
                        <Text className="text-emerald-600 text-[11px] font-semibold">✓ Subido a Firebase Storage</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="bg-slate-200 px-3 py-1.5 rounded-lg"
                      onPress={() => handlePickAndUploadVoucher(b)}
                    >
                      <Text className="text-slate-700 text-[11px] font-bold">Cambiar</Text>
                    </TouchableOpacity>
                  </View>
                ) : isPending ? (
                  <View className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 mt-1">
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <Ionicons name="cloud-upload-outline" size={16} color="#D97706" />
                      <Text className="text-amber-900 text-[12px] font-bold">Adjunta tu Voucher de Pago</Text>
                    </View>
                    <Text className="text-amber-800 text-[11px] mb-2.5">
                      Sube la captura de tu transferencia o pago para que Recepción confirme tu reserva.
                    </Text>

                    <TouchableOpacity
                      className="bg-amber-600 py-2.5 rounded-lg items-center flex-row justify-center gap-2 shadow-sm"
                      onPress={() => handlePickAndUploadVoucher(b)}
                      disabled={uploadingId === b.id}
                    >
                      {uploadingId === b.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="image-outline" size={16} color="#FFFFFF" />
                          <Text className="text-white text-[12px] font-bold">Subir Captura del Voucher</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
