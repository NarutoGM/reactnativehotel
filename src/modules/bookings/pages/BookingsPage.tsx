import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/modules/auth/api/auth.api';
import { bookingsApi, Booking } from '../api/bookings.api';
import { Room } from '@/modules/rooms/api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { RoomDetailModal } from '@/modules/rooms/components/RoomDetailModal';

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

  useEffect(() => {
    loadBookings();
  }, []);

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
        Alert.alert('¡Éxito!', 'Comprobante(s) subido(s) correctamente.');
        loadBookings();
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
    if (activeCategory === 'CANCELLED') {
      return b.status === 'CANCELLED' || b.status === 'REJECTED';
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Category Tabs: Pendientes / Activas / Canceladas */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeCategory === 'PENDING' && styles.tabButtonActive]}
          onPress={() => setActiveCategory('PENDING')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'PENDING' && styles.tabTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeCategory === 'ACTIVE' && styles.tabButtonActive]}
          onPress={() => setActiveCategory('ACTIVE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'ACTIVE' && styles.tabTextActive]}>
            Activas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeCategory === 'CANCELLED' && styles.tabButtonActive]}
          onPress={() => setActiveCategory('CANCELLED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'CANCELLED' && styles.tabTextActive]}>
            Canceladas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#488C8C" />
            <Text style={styles.loadingText}>Cargando tus reservas...</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>
              No hay reservas en esta categoría
            </Text>
            <Text style={styles.emptySubtitle}>
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
              <View key={b.id} style={styles.bookingCard}>
                {/* Header Card con código y estado limpio */}
                <View style={styles.cardHeader}>
                  <View style={styles.bookingCodeRow}>
                    <Ionicons name="bookmark" size={16} color={iconColor} />
                    <Text style={styles.bookingCodeText}>
                      {b.bookingId}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      b.status === 'CONFIRMED'
                        ? styles.statusBadgeConfirmed
                        : b.status === 'CHECKED_IN'
                        ? styles.statusBadgeCheckedIn
                        : b.status === 'PENDING'
                        ? styles.statusBadgePending
                        : b.status === 'CANCELLED' || b.status === 'REJECTED'
                        ? styles.statusBadgeCancelled
                        : styles.statusBadgeNeutral,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        b.status === 'CONFIRMED'
                          ? styles.statusTextConfirmed
                          : b.status === 'CHECKED_IN'
                          ? styles.statusTextCheckedIn
                          : b.status === 'PENDING'
                          ? styles.statusTextPending
                          : b.status === 'CANCELLED' || b.status === 'REJECTED'
                          ? styles.statusTextCancelled
                          : styles.statusTextNeutral,
                      ]}
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

                {/* Room Info */}
                <View style={styles.cardBody}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (b.room) setDetailRoom(b.room);
                    }}
                    style={styles.roomTitleTouchable}
                  >
                    <Text style={styles.roomTitle}>
                      {b.room?.title || 'Habitación en Aura Grand Hotel'}
                    </Text>
                    <View style={styles.viewDetailBadge}>
                      <Text style={styles.viewDetailText}>Ver detalle</Text>
                      <Ionicons name="chevron-forward" size={13} color="#488C8C" />
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.roomDetails}>
                      {b.checkInDate} al {b.checkOutDate} ({b.nights} {b.nights === 1 ? 'noche' : 'noches'})
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.roomDetails}>
                      {b.guestsCount} {b.guestsCount === 1 ? 'huésped' : 'huéspedes'}
                    </Text>
                  </View>

                  <Text style={styles.roomTotal}>
                    Total: <Text style={styles.roomTotalAmount}>S/ {b.totalAmount}</Text>
                  </Text>
                </View>

                {/* Voucher Action: Comprobantes sin borde/bg pesado, hasta 2 comprobantes */}
                {hasVouchers ? (
                  <View style={styles.voucherContainer}>
                    <Text style={styles.voucherTitle}>
                      {vouchers.length === 1 ? 'Comprobante Adjunto' : 'Comprobantes Adjuntos (2/2)'}
                    </Text>

                    <View style={styles.voucherThumbnailsRow}>
                      {vouchers.map((url, idx) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.8}
                          onPress={() => setPreviewImageUrl(url)}
                          style={styles.voucherThumbnailWrapper}
                        >
                          <Image
                            source={{ uri: url }}
                            style={styles.voucherThumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.voucherBadgeOverlay}>
                            <Text style={styles.voucherBadgeText}>#{idx + 1}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      {/* Si solo hay 1 comprobante y sigue pendiente, permitir adjuntar el 2do */}
                      {vouchers.length < 2 && isPending && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handlePickAndUploadVoucher(b)}
                          disabled={uploadingId === b.id}
                          style={styles.addSecondVoucherButton}
                        >
                          {uploadingId === b.id ? (
                            <ActivityIndicator size="small" color="#488C8C" />
                          ) : (
                            <>
                              <Ionicons name="add-circle-outline" size={18} color="#488C8C" />
                              <Text style={styles.addSecondVoucherText}>+ 2do Comprobante</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : isPending ? (
                  <View style={styles.voucherButtonContainer}>
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

      {/* Modal Detalles de Habitación (Solo lectura informativa, sin botón de reservar) */}
      <RoomDetailModal
        room={detailRoom}
        onClose={() => setDetailRoom(null)}
        showBookButton={false}
      />

      {/* Modal Preview de Imagen de Comprobante en Pantalla Completa */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity
            style={styles.imagePreviewCloseBtn}
            onPress={() => setPreviewImageUrl(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.imagePreviewFull}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  tabButtonActive: {
    backgroundColor: '#488C8C',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  centerBox: {
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  bookingCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingCodeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePending: {
    backgroundColor: '#FFF7ED',
  },
  statusBadgeConfirmed: {
    backgroundColor: '#F0FDF4',
  },
  statusBadgeCheckedIn: {
    backgroundColor: '#F0FDF4',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeNeutral: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusTextPending: {
    color: '#EA580C', // Naranja
  },
  statusTextConfirmed: {
    color: '#16A34A', // Verde
  },
  statusTextCheckedIn: {
    color: '#16A34A', // Verde
  },
  statusTextCancelled: {
    color: '#DC2626', // Rojo
  },
  statusTextNeutral: {
    color: '#64748B',
  },
  cardBody: {
    paddingVertical: 10,
  },
  roomTitleTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roomTitle: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
  },
  viewDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewDetailText: {
    color: '#488C8C',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3.5,
  },
  roomDetails: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  roomTotal: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 6,
  },
  roomTotalAmount: {
    fontWeight: '900',
    fontSize: 16,
    color: '#0F172A',
  },
  voucherButtonContainer: {
    marginTop: 6,
  },
  voucherContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  voucherTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  voucherThumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voucherThumbnailWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  voucherThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  voucherBadgeOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  voucherBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  addSecondVoucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#488C8C',
    backgroundColor: '#F0FDFA',
    gap: 6,
  },
  addSecondVoucherText: {
    color: '#488C8C',
    fontSize: 11,
    fontWeight: '700',
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imagePreviewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewFull: {
    width: '100%',
    height: '80%',
  },
});
