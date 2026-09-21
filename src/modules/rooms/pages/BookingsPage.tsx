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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../auth/api/auth.api';
import { roomsApi, Booking } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';

interface BookingsPageProps {
  currentUser: User;
}

type BookingCategory = 'PENDING' | 'ACTIVE' | 'CANCELLED';

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
          Alert.alert('¡Éxito!', 'La captura del voucher se ha subido correctamente.');
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
            const hasVoucher = !!b.voucherFileName;

            return (
              <View key={b.id} style={styles.bookingCard}>
                {/* Header Card con código y estado limpio sin bordes amarillos */}
                <View style={styles.cardHeader}>
                  <View style={styles.bookingCodeRow}>
                    <Ionicons name="bookmark" size={16} color="#488C8C" />
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
                  <Text style={styles.roomTitle}>
                    {b.room?.title || 'Habitación en Aura Grand Hotel'}
                  </Text>
                  <Text style={styles.roomDetails}>
                    📅 {b.checkInDate} al {b.checkOutDate} · {b.nights} noche(s) · {b.guestsCount} huésped(es)
                  </Text>
                  <Text style={styles.roomTotal}>
                    Total: <Text style={styles.roomTotalAmount}>S/ {b.totalAmount}</Text>
                  </Text>
                </View>

                {/* Voucher Action: Botón Limpio Variante 3 (Gradient/Solid) sin caja naranja */}
                {hasVoucher ? (
                  <View style={styles.voucherUploadedRow}>
                    <View style={styles.voucherPreviewLeft}>
                      <Image
                        source={{ uri: b.voucherFileName! }}
                        style={styles.voucherThumbnail}
                        resizeMode="cover"
                      />
                      <View>
                        <Text style={styles.voucherTitle}>Comprobante Adjunto</Text>
                        <Text style={styles.voucherSub}>✓ Guardado en sistema</Text>
                      </View>
                    </View>

                    <LuxuryButton
                      title="Cambiar"
                      variant="outline"
                      size="sm"
                      onPress={() => handlePickAndUploadVoucher(b)}
                      loading={uploadingId === b.id}
                    />
                  </View>
                ) : isPending ? (
                  <View style={styles.voucherButtonContainer}>
                    <LuxuryButton
                      title="Subir Voucher"
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
  roomTitle: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
  },
  roomDetails: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
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
    marginTop: 4,
  },
  voucherUploadedRow: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voucherPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  voucherThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  voucherTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  voucherSub: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
  },
});

