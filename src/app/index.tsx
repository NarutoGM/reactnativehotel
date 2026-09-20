import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, User } from '@/services/auth.service';
import { roomsService, Room } from '@/services/rooms.service';

export default function AppScreen() {
  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Formulario Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  // Estado del Buscador de Habitaciones (Vista Cliente)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [capacity, setCapacity] = useState('2');
  const [checkIn, setCheckIn] = useState('2026-09-20');
  const [checkOut, setCheckOut] = useState('2026-09-23');

  // Modal de Reserva
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<any | null>(null);

  // Cargar habitaciones disponibles al iniciar
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (targetCapacity = capacity, inDate = checkIn, outDate = checkOut) => {
    setRoomsLoading(true);
    const parsedCap = parseInt(targetCapacity, 10) || 1;
    const res = await roomsService.searchRooms({
      capacity: parsedCap,
      checkIn: inDate,
      checkOut: outDate,
    });
    setRoomsLoading(false);
    if (res.success) {
      setRooms(res.rooms);
    }
  };

  // Login
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const res = await authService.login({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    setAuthLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      fetchRooms();
    } else {
      setAuthError(res.error || 'Credenciales inválidas.');
    }
  };

  // Register
  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setAuthError('Completa todos los campos obligatorios.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const res = await authService.register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      documentNumber: documentNumber.trim() || 'N/A',
      role: 'GUEST',
    });
    setAuthLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      fetchRooms();
    } else {
      setAuthError(res.error || 'No se pudo crear la cuenta.');
    }
  };

  // Reserva de Habitación
  const handleBookRoom = async () => {
    if (!selectedRoom || !currentUser) return;
    setBookingLoading(true);

    const checkInMs = new Date(checkIn).getTime();
    const checkOutMs = new Date(checkOut).getTime();
    const nights = Math.max(1, Math.round((checkOutMs - checkInMs) / (1000 * 60 * 60 * 24))) || 1;
    const totalAmount = nights * selectedRoom.pricePerNight;

    const res = await roomsService.createBooking({
      roomId: selectedRoom.id,
      userId: currentUser.id,
      guestName: currentUser.fullName,
      guestEmail: currentUser.email,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestsCount: parseInt(capacity, 10) || 2,
      totalAmount,
    });

    setBookingLoading(false);

    if (res.success) {
      const roomReserved = selectedRoom;
      setSelectedRoom(null);
      setBookingSuccessModal({
        ...res.booking,
        roomTitle: roomReserved.title,
        nights,
        totalAmount,
      });
      fetchRooms();
    } else {
      Alert.alert('Error', res.error || 'No se pudo completar la reserva.');
    }
  };

  // Quick fill helper
  const fillCredentials = (quickEmail: string, roleTitle: string) => {
    setEmail(quickEmail);
    setPassword('Aura2026!');
    setAuthError('');
    setAuthSuccess(`Cargado para: ${roleTitle}`);
  };

  // ==========================================
  // VISTA 1: AUTENTICACIÓN (LOGIN / REGISTRO)
  // ==========================================
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.darkContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.authScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.brandBox}>
              <Text style={styles.brandTitle}>🏨 AURA GRAND HOTEL</Text>
              <Text style={styles.brandSubtitle}>Ingresa a tu cuenta para buscar y reservar</Text>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabBtn, isLogin && styles.tabBtnActive]}
                onPress={() => {
                  setIsLogin(true);
                  setAuthError('');
                }}
              >
                <Text style={[styles.tabBtnText, isLogin && styles.tabBtnTextActive]}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, !isLogin && styles.tabBtnActive]}
                onPress={() => {
                  setIsLogin(false);
                  setAuthError('');
                }}
              >
                <Text style={[styles.tabBtnText, !isLogin && styles.tabBtnTextActive]}>Crear Cuenta</Text>
              </TouchableOpacity>
            </View>

            {authError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {authSuccess ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>{authSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.authCard}>
              {!isLogin && (
                <>
                  <Text style={styles.label}>Nombre Completo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Sofia Morales"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <Text style={styles.label}>DNI / Pasaporte</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 72891045"
                    placeholderTextColor="#64748B"
                    value={documentNumber}
                    onChangeText={setDocumentNumber}
                  />
                </>
              )}

              <Text style={styles.label}>Correo Electrónico *</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@aurahotel.pe"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isLogin ? 'Entrar a Aura Hotel' : 'Registrarme'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Accesos rápidos dentro del mismo card */}
              {isLogin && (
                <View style={styles.quickAccessSection}>
                  <View style={styles.quickDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.quickTitle}>Accesos de prueba rápidos</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.quickRow}>
                    <TouchableOpacity
                      style={styles.quickBtn}
                      onPress={() => fillCredentials('huesped@aurahotel.pe', 'Huésped')}
                    >
                      <Text style={styles.quickBtnText}>👤 Huésped</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickBtn}
                      onPress={() => fillCredentials('recepcion@aurahotel.pe', 'Recepción')}
                    >
                      <Text style={styles.quickBtnText}>🛎️ Recepción</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickBtn, styles.quickBtnAdmin]}
                      onPress={() => fillCredentials('admin@aurahotel.pe', 'Admin')}
                    >
                      <Text style={[styles.quickBtnText, styles.quickBtnAdminText]}>🛡️ Admin</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.quickHint}>Contraseña única: Aura2026!</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VISTA 2: CLIENTE / HUÉSPED (BUSCADOR & HABITACIONES)
  // ==========================================
  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerHotel}>🏨 AURA GRAND HOTEL</Text>
          <Text style={styles.headerUser}>Hola, {currentUser.fullName.split(' ')[0]} 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutPill} onPress={() => setCurrentUser(null)}>
          <Text style={styles.logoutPillText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador Superior: Fechas y Capacidad */}
      <View style={styles.searchBox}>
        <Text style={styles.searchTitle}>🔍 Encuentra tu Habitación Ideal</Text>

        <View style={styles.searchInputsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.filterLabel}>Entrada (Check-in)</Text>
            <TextInput
              style={styles.filterInput}
              value={checkIn}
              onChangeText={setCheckIn}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.filterLabel}>Salida (Check-out)</Text>
            <TextInput
              style={styles.filterInput}
              value={checkOut}
              onChangeText={setCheckOut}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ width: 85 }}>
            <Text style={styles.filterLabel}>Huéspedes</Text>
            <TextInput
              style={styles.filterInput}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              placeholder="2"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={() => fetchRooms()}>
          <Text style={styles.searchBtnText}>Aplicar Filtros y Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Resultados / Lista de Habitaciones */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.resultsTitle}>
            Habitaciones Disponibles ({rooms.length})
          </Text>
          <Text style={styles.resultsSubtitle}>Para {capacity} personas</Text>
        </View>

        {roomsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Buscando habitaciones en Neon DB...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏨</Text>
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
            renderItem={({ item }) => {
              const defaultImage =
                item.type.toLowerCase().includes('suite')
                  ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
                  : 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80';

              return (
                <View style={styles.roomCard}>
                  <Image
                    source={{ uri: item.imageUrl || defaultImage }}
                    style={styles.roomImage}
                    resizeMode="cover"
                  />
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomBadgeText}>{item.roomNumber}</Text>
                  </View>

                  <View style={styles.roomDetails}>
                    <View style={styles.roomTitleRow}>
                      <Text style={styles.roomTitle}>{item.title}</Text>
                      <Text style={styles.roomRating}>★ {item.rating || 4.8}</Text>
                    </View>

                    <Text style={styles.roomMeta}>
                      Piso {item.floor} · {item.bedType} · {item.surfaceAreaM2} m²
                    </Text>

                    <View style={styles.chipsRow}>
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>👥 Hasta {item.capacity} pers.</Text>
                      </View>
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>✨ Vista Exterior</Text>
                      </View>
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>📶 Wi-Fi Gratis</Text>
                      </View>
                    </View>

                    <View style={styles.roomFooter}>
                      <View>
                        <Text style={styles.priceLabel}>Precio por noche</Text>
                        <Text style={styles.priceValue}>S/ {item.pricePerNight}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => setSelectedRoom(item)}
                      >
                        <Text style={styles.bookBtnText}>Reservar Ahora</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* MODAL DE CONFIRMACIÓN DE RESERVA */}
      <Modal visible={!!selectedRoom} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRoom && (
              <>
                <Text style={styles.modalTitle}>Confirmar Reserva</Text>
                <Text style={styles.modalSubtitle}>{selectedRoom.title}</Text>

                <View style={styles.modalInfoBox}>
                  <Text style={styles.modalInfoItem}>
                    📅 <Text style={{ fontWeight: 'bold' }}>Fechas:</Text> {checkIn} al {checkOut}
                  </Text>
                  <Text style={styles.modalInfoItem}>
                    👥 <Text style={{ fontWeight: 'bold' }}>Huéspedes:</Text> {capacity} personas
                  </Text>
                  <Text style={styles.modalInfoItem}>
                    🛏️ <Text style={{ fontWeight: 'bold' }}>Camas:</Text> {selectedRoom.bedType}
                  </Text>
                  <Text style={styles.modalInfoItem}>
                    💵 <Text style={{ fontWeight: 'bold' }}>Tarifa:</Text> S/ {selectedRoom.pricePerNight} / noche
                  </Text>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setSelectedRoom(null)}
                    disabled={bookingLoading}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleBookRoom}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalConfirmText}>Confirmar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL RESERVA EXITOSA */}
      <Modal visible={!!bookingSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSuccessContent}>
            <Text style={{ fontSize: 44, textAlign: 'center', marginBottom: 10 }}>🎉</Text>
            <Text style={styles.successModalTitle}>¡Reserva Registrada!</Text>
            <Text style={styles.successModalDesc}>
              Tu reserva para <Text style={{ fontWeight: 'bold' }}>{bookingSuccessModal?.roomTitle}</Text> ha sido creada en estado pendiente de voucher.
            </Text>

            <View style={styles.ticketBox}>
              <Text style={styles.ticketLabel}>Código de Reserva:</Text>
              <Text style={styles.ticketCode}>{bookingSuccessModal?.bookingId}</Text>
              <Text style={styles.ticketTotal}>Total: S/ {bookingSuccessModal?.totalAmount}</Text>
            </View>

            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={() => setBookingSuccessModal(null)}
            >
              <Text style={styles.successDoneText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Gris plomo claro / slate elegante
  },
  authScroll: {
    padding: 20,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginVertical: 18,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A', // Slate 900 elegante
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B', // Slate 500
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0', // Plomo suave
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF', // Blanco activo
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: '#16A34A',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: '#FFFFFF', // Blanco puro
    borderRadius: 18,
    padding: 22,
    shadowColor: '#64748B',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    color: '#334155', // Slate 700
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC', // Blanco ahumado
    borderColor: '#CBD5E1', // Borde plomo suave
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#0F172A', // Azul marino/carbón premium
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  quickAccessSection: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  quickTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  quickBtnAdmin: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
  },
  quickBtnAdminText: {
    color: '#EA580C',
  },
  quickHint: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },

  // CLIENT DASHBOARD STYLES
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
  },
  headerHotel: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerUser: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutPillText: {
    color: '#F87171',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchBox: {
    backgroundColor: '#1E293B',
    margin: 12,
    padding: 14,
    borderRadius: 14,
    borderColor: '#334155',
    borderWidth: 1,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  searchInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  filterInput: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  searchBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultsSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
    gap: 14,
  },
  roomCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    overflow: 'hidden',
    borderColor: '#334155',
    borderWidth: 1,
  },
  roomImage: {
    width: '100%',
    height: 160,
  },
  roomBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roomDetails: {
    padding: 14,
  },
  roomTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  roomRating: {
    color: '#F59E0B',
    fontWeight: 'bold',
    fontSize: 13,
  },
  roomMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  chip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderColor: '#334155',
    borderWidth: 1,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopColor: '#334155',
    borderTopWidth: 1,
  },
  priceLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  priceValue: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
  },
  bookBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 13,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyDesc: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    borderColor: '#334155',
    borderWidth: 1,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#38BDF8',
    fontSize: 14,
    marginBottom: 14,
  },
  modalInfoBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  modalInfoItem: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // SUCCESS MODAL
  modalSuccessContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  successModalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  successModalDesc: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  ticketBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    borderStyle: 'dashed',
    borderColor: '#38BDF8',
    borderWidth: 1,
  },
  ticketLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  ticketCode: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginVertical: 4,
  },
  ticketTotal: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successDoneBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  successDoneText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
