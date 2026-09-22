import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/modules/auth/api/auth.api';
import { bookingsApi, Booking } from '../api/bookings.api';
import { Room } from '@/modules/rooms/api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { RoomDetailModal } from '@/modules/rooms/components/RoomDetailModal';
import { SuccessModal } from '@/components/SuccessModal';

interface BookingsPageProps {
  currentUser: User;
}

type BookingCategory = 'PENDING' | 'ACTIVE' | 'CANCELLED';

const getVouchers = (voucherFileName?: string | null): string[] => {
  if (!voucherFileName) return [];
  return voucherFileName
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

export const BookingsPage: React.FC<BookingsPageProps> = ({ currentUser }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<BookingCategory>('PENDING');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<{ bookingCode: string } | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadBookings();
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (createdAtStr: string) => {
    const createdTime = new Date(createdAtStr).getTime();
    const expiryTime = createdTime + 15 * 60 * 1000;
    const diffMs = expiryTime - now;
    if (diffMs <= 0) {
      return { expired: true, text: '00:00', totalSeconds: 0 };
    }
    const totalSeconds = Math.floor(diffMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return {
      expired: false,
      text: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      totalSeconds,
    };
  };

  const loadBookings = async () => {
    setLoading(true);
    const res = await bookingsApi.getBookings(currentUser.role === 'GUEST' ? currentUser.id : undefined);
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
          'Módulo de Galería',
          'El módulo nativo se está vinculando. Si estás en emulador, reinicia con expo run:android.'
        );
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso Denegado', 'Necesitamos acceso a la galería para seleccionar la captura del comprobante.');
        return;
      }

      const currentVouchers = getVouchers(booking.voucherFileName);
      const remainingLimit = Math.max(1, 2 - currentVouchers.length);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: remainingLimit > 1,
        selectionLimit: remainingLimit,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingId(booking.id);
        const assetsToUpload = result.assets.slice(0, remainingLimit);
        for (const asset of assetsToUpload) {
          if (asset.uri) {
            await bookingsApi.uploadVoucher(booking.id, asset.uri);
          }
        }
        setUploadingId(null);
        loadBookings();
      }
    } catch (e: any) {
      setUploadingId(null);
      Alert.alert('Error', e.message || 'Ocurrió un error al seleccionar la imagen.');
    }
  };

  const handleDeleteVoucher = (bookingId: string, index: number) => {
    Alert.alert(
      'Eliminar Comprobante',
      '¿Deseas quitar esta captura de comprobante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const res = await bookingsApi.deleteVoucher(bookingId, index);
            if (res.success) {
              loadBookings();
            } else {
              Alert.alert('Error', res.error || 'No se pudo eliminar el comprobante.');
            }
          },
        },
      ]
    );
  };

  const handleSubmitVouchers = async (booking: Booking) => {
    setSubmittingId(booking.id);
    const res = await bookingsApi.submitVouchers(booking.id);
    setSubmittingId(null);
    if (res.success) {
      setUploadSuccessInfo({ bookingCode: booking.bookingId });
      loadBookings();
    } else {
      Alert.alert('Error', res.error || 'No se pudo enviar el comprobante.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeCategory === 'PENDING') {
      return b.status === 'PENDING';
    }
    if (activeCategory === 'ACTIVE') {
      return b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
    }
    if (activeCategory === 'CANCELLED') {
      return b.status === 'CANCELLED' || b.status === 'REJECTED';
    }
    return true;
  });

  return (
    <View className="flex-1 bg-slate-100">
      {/* Category Tabs: Pendientes / Activas / Canceladas */}
      <View className="flex-row bg-white p-1.5 mx-3.5 mt-3.5 rounded-2xl border border-slate-200 gap-1.5">
        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeCategory === 'PENDING' ? 'bg-[#488C8C]' : 'bg-slate-50'
          }`}
          onPress={() => setActiveCategory('PENDING')}
          activeOpacity={0.8}
        >
          <Text
            className={`text-[12px] font-bold ${
              activeCategory === 'PENDING' ? 'text-white font-extrabold' : 'text-slate-500'
            }`}
          >
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeCategory === 'ACTIVE' ? 'bg-[#488C8C]' : 'bg-slate-50'
          }`}
          onPress={() => setActiveCategory('ACTIVE')}
          activeOpacity={0.8}
        >
          <Text
            className={`text-[12px] font-bold ${
              activeCategory === 'ACTIVE' ? 'text-white font-extrabold' : 'text-slate-500'
            }`}
          >
            Activas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeCategory === 'CANCELLED' ? 'bg-[#488C8C]' : 'bg-slate-50'
          }`}
          onPress={() => setActiveCategory('CANCELLED')}
          activeOpacity={0.8}
        >
          <Text
            className={`text-[12px] font-bold ${
              activeCategory === 'CANCELLED' ? 'text-white font-extrabold' : 'text-slate-500'
            }`}
          >
            Canceladas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-16">
            <ActivityIndicator size="large" color="#488C8C" />
            <Text className="text-slate-500 text-[13px] font-medium mt-3">Cargando tus reservas...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8 py-16">
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text className="text-slate-900 text-[16px] font-bold mt-3">
              No hay reservas en esta categoría
            </Text>
            <Text className="text-slate-500 text-center text-[12px] mt-1">
              Las reservas realizadas se mostrarán aquí con su estado actual y comprobante.
            </Text>
          </View>
        ) : (
          filteredBookings.map((b) => {
            const isPending = b.status === 'PENDING';
            const vouchers = getVouchers(b.voucherFileName);
            const hasVouchers = vouchers.length > 0;
            const iconColor =
              b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
                ? '#16A34A'
                : b.status === 'PENDING'
                ? '#EA580C'
                : b.status === 'CANCELLED' || b.status === 'REJECTED'
                ? '#DC2626'
                : '#64748B';

            return (
              <View
                key={b.id}
                className="bg-white mx-3.5 mb-3 rounded-2xl p-4 border border-slate-200 shadow-sm elevation-2"
              >
                {/* Header Card con código y estado */}
                <View className="flex-row justify-between items-center pb-2.5 border-b border-slate-100">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="bookmark" size={16} color={iconColor} />
                    <Text className="text-slate-900 font-black text-[14px] tracking-wide">
                      {b.bookingId}
                    </Text>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-full ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100'
                        : b.status === 'CHECKED_IN'
                        ? 'bg-sky-100'
                        : b.status === 'PENDING'
                        ? 'bg-orange-100'
                        : b.status === 'CANCELLED' || b.status === 'REJECTED'
                        ? 'bg-red-100'
                        : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black tracking-wide ${
                        b.status === 'CONFIRMED'
                          ? 'text-emerald-700'
                          : b.status === 'CHECKED_IN'
                          ? 'text-sky-700'
                          : b.status === 'PENDING'
                          ? 'text-orange-700'
                          : b.status === 'CANCELLED' || b.status === 'REJECTED'
                          ? 'text-red-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {b.status === 'PENDING'
                        ? 'PENDIENTE DE VOUCHER'
                        : b.status === 'CONFIRMED'
                        ? 'CONFIRMADA'
                        : b.status === 'CHECKED_IN'
                        ? 'EN ESTADÍA'
                        : b.status === 'CHECKED_OUT'
                        ? 'FINALIZADA'
                        : b.status === 'CANCELLED'
                        ? 'CANCELADA'
                        : b.status === 'REJECTED'
                        ? 'RECHAZADA'
                        : b.status}
                    </Text>
                  </View>
                </View>

                {/* Banner de Contador Regresivo (15 minutos para subir comprobante) */}
                {isPending && !b.voucherSubmitted && (
                  (() => {
                    const timer = getRemainingTime(b.createdAt);
                    if (timer.expired) {
                      return (
                        <View className="mt-2.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex-row items-center gap-2">
                          <Ionicons name="alert-circle" size={16} color="#DC2626" />
                          <Text className="text-red-700 text-[11px] font-bold flex-1">
                            Plazo vencido · La reserva será cancelada automáticamente
                          </Text>
                        </View>
                      );
                    }
                    const isUrgent = timer.totalSeconds <= 180; // Menos de 3 minutos
                    return (
                      <View
                        className={`mt-2.5 border rounded-xl px-3 py-2 flex-row items-center justify-between ${
                          isUrgent ? 'bg-red-50/80 border-red-200' : 'bg-[#EBF4F4] border-[#CDE5E5]'
                        }`}
                      >
                        <View className="flex-row items-center gap-1.5 flex-1">
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={isUrgent ? '#DC2626' : '#488C8C'}
                          />
                          <Text
                            className={`text-[11px] font-bold ${
                              isUrgent ? 'text-red-700' : 'text-[#2D5A5A]'
                            }`}
                          >
                            Tiempo para subir comprobante:
                          </Text>
                        </View>
                        <View
                          className={`px-2.5 py-0.5 rounded-lg ${
                            isUrgent ? 'bg-red-600' : 'bg-[#488C8C]'
                          }`}
                        >
                          <Text className="text-white text-[12px] font-black tracking-wider">
                            {timer.text}
                          </Text>
                        </View>
                      </View>
                    );
                  })()
                )}

                {/* Room Info */}
                <View className="pt-3 pb-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (b.room) setDetailRoom(b.room);
                    }}
                    className="flex-row justify-between items-center mb-1.5"
                  >
                    <Text className="text-slate-900 font-black text-[16px] flex-1 pr-2">
                      {b.room?.title || 'Habitación en Aura Grand Hotel'}
                    </Text>
                    <View className="flex-row items-center bg-[#EBF4F4] px-2 py-0.5 rounded-md">
                      <Text className="text-[#488C8C] text-[11px] font-bold mr-0.5">Ver detalle</Text>
                      <Ionicons name="chevron-forward" size={13} color="#488C8C" />
                    </View>
                  </TouchableOpacity>

                  <View className="flex-row items-center mt-1">
                    <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text className="text-slate-500 text-[12px] font-semibold">
                      {b.checkInDate} al {b.checkOutDate} ({b.nights} {b.nights === 1 ? 'noche' : 'noches'})
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <Ionicons name="people-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text className="text-slate-500 text-[12px] font-semibold">
                      {b.guestsCount} {b.guestsCount === 1 ? 'huésped' : 'huéspedes'}
                    </Text>
                  </View>

                  <View className="mt-2 pt-2 border-t border-slate-100 gap-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-500 text-[12px] font-semibold">Total estadía:</Text>
                      <Text className="text-slate-800 text-[13px] font-bold">S/ {b.totalAmount}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-700 text-[13px] font-extrabold">Monto para reservar (50%):</Text>
                      <Text className="text-[#488C8C] text-[16px] font-black">
                        S/ {Math.round(b.totalAmount * 0.5)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Voucher Action: Comprobantes sin borde/bg pesado, hasta 2 comprobantes */}
                {hasVouchers ? (
                  <View className="mt-2.5 pt-2.5 border-t border-slate-100">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-slate-900 text-[12px] font-extrabold">
                        {vouchers.length === 1 ? 'Comprobante Adjunto' : 'Comprobantes Adjuntos (2/2)'}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                      {vouchers.map((url, idx) => (
                        <View key={idx} className="relative">
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setPreviewImageUrl(url)}
                            className="relative rounded-xl overflow-hidden"
                          >
                            <Image
                              source={{ uri: url }}
                              className="w-15 h-15 rounded-xl bg-slate-200"
                              resizeMode="cover"
                            />
                            <View className="absolute bottom-1 right-1 bg-slate-900/75 px-1.5 py-0.5 rounded">
                              <Text className="text-white text-[9px] font-extrabold">#{idx + 1}</Text>
                            </View>
                          </TouchableOpacity>

                          {/* Botón para eliminar foto (solo si aún no se ha enviado definitivamente) */}
                          {!b.voucherSubmitted && isPending && (
                            <TouchableOpacity
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 justify-center items-center shadow-sm z-10"
                              onPress={() => handleDeleteVoucher(b.id, idx)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="close" size={13} color="#FFFFFF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}

                      {/* Si solo hay 1 comprobante y aún no se envió, permitir adjuntar el 2do */}
                      {vouchers.length < 2 && isPending && !b.voucherSubmitted && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handlePickAndUploadVoucher(b)}
                          disabled={uploadingId === b.id}
                          className="w-15 h-15 rounded-xl border border-dashed border-[#488C8C] bg-[#F0FDFA] justify-center items-center"
                        >
                          {uploadingId === b.id ? (
                            <ActivityIndicator size="small" color="#488C8C" />
                          ) : (
                            <Ionicons name="add" size={24} color="#488C8C" />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Botón de Enviar definitivo: una vez presionado bloquea la edición */}
                    {!b.voucherSubmitted && isPending && (
                      <View className="mt-3">
                        <LuxuryButton
                          title="Enviar Comprobante(s)"
                          variant="solid"
                          size="sm"
                          iconName="paper-plane-outline"
                          loading={submittingId === b.id}
                          onPress={() => handleSubmitVouchers(b)}
                        />
                      </View>
                    )}
                  </View>
                ) : isPending ? (
                  <View className="mt-1.5">
                    <LuxuryButton
                      title="Subir Comprobante (Hasta 2)"
                      variant="solid"
                      size="md"
                      iconName="cloud-upload-outline"
                      style={{ paddingVertical: 11, minHeight: 44, borderRadius: 12 }}
                      onPress={() => handlePickAndUploadVoucher(b)}
                      loading={uploadingId === b.id}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Detalles de Habitación (Solo lectura informativa) */}
      <RoomDetailModal
        room={detailRoom}
        onClose={() => setDetailRoom(null)}
        showBookButton={false}
      />

      {/* Modal Preview de Imagen de Comprobante en Pantalla Completa con fondo transparente */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View className="flex-1 bg-transparent justify-center items-center p-4">
          <TouchableOpacity
            className="absolute top-12 right-5 z-50 w-11 h-11 rounded-full bg-slate-900/75 justify-center items-center"
            onPress={() => setPreviewImageUrl(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              className="w-full h-[80%]"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Modal de Éxito al Subir Comprobante (Custom UI con Tailwind) */}
      <SuccessModal
        visible={!!uploadSuccessInfo}
        title="¡Comprobante Registrado!"
        message="Tu comprobante de pago ha sido adjuntado con éxito. El equipo de recepción lo verificará para confirmar tu reserva."
        badgeText={uploadSuccessInfo ? `Código: ${uploadSuccessInfo.bookingCode}` : undefined}
        buttonText="Entendido"
        onClose={() => setUploadSuccessInfo(null)}
      />
    </View>
  );
};
