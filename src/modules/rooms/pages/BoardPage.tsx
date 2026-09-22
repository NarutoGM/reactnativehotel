import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, roomsApi, formatRoomNumber, Booking, BookingPayload } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { CalendarPickerModal } from '../components/CalendarPickerModal';

export const BoardPage: React.FC = () => {
  const [rooms, setRooms] = useState<(Room & { bookings?: Booking[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = mes actual, 1 = sig, -1 = ant
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    room: Room;
    date: string;
    dayFormatted: string;
    status: 'AVAILABLE' | 'MAINTENANCE' | 'BOOKED' | 'INACTIVE';
    booking?: Booking;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para la Creación de Reserva Manual / Presencial
  const [manualBookingModalVisible, setManualBookingModalVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'checkIn' | 'checkOut' | null>(null);
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualGuestPhone, setManualGuestPhone] = useState('');
  const [manualGuestEmail, setManualGuestEmail] = useState('');
  const [manualCheckIn, setManualCheckIn] = useState('');
  const [manualCheckOut, setManualCheckOut] = useState('');
  const [manualGuestsCount, setManualGuestsCount] = useState('2');
  const [manualNights, setManualNights] = useState('1');
  const [manualTotalAmount, setManualTotalAmount] = useState('0');
  const [manualStatus, setManualStatus] = useState<'CONFIRMED' | 'CHECKED_IN' | 'PENDING'>('CONFIRMED');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [creatingManualBooking, setCreatingManualBooking] = useState(false);

  // Calcular rango de días para el mes visible
  const { days, currentMonthName } = useMemo(() => {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + selectedMonthOffset);
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const currentMonthName = `${monthNames[month]} ${year}`;

    // Cantidad de días en el mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const daysList = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dayOfWeek = dayNames[d.getDay()];
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday =
        new Date().toISOString().split('T')[0] === dateStr;

      daysList.push({
        dayNumber: day,
        dayOfWeek,
        dateStr,
        isToday,
      });
    }

    return { days: daysList, currentMonthName };
  }, [selectedMonthOffset]);

  const loadBoardData = async () => {
    setLoading(true);
    const startDate = days[0]?.dateStr;
    const endDate = days[days.length - 1]?.dateStr;
    const res = await roomsApi.getCalendarRooms(startDate, endDate);
    setLoading(false);
    if (res.success) {
      setRooms(res.rooms);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [selectedMonthOffset]);

  // Abrir Modal para crear una reserva presencial / manual rápida
  const [targetRoomForBooking, setTargetRoomForBooking] = useState<Room | null>(null);

  const handleOpenManualBooking = (room: Room, dateStr: string) => {
    setTargetRoomForBooking(room);
    setManualCheckIn(dateStr);

    // Calcular checkout por defecto (+1 día)
    const nextDay = new Date(dateStr + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDateStr = nextDay.toISOString().split('T')[0];
    setManualCheckOut(nextDateStr);

    setManualGuestName('');
    setManualGuestPhone('');
    setManualGuestEmail('');
    setManualGuestsCount(String(Math.min(2, room.capacity || 2)));
    setManualNights('1');
    setManualTotalAmount(String(room.pricePerNight));
    setManualStatus('CONFIRMED');
    setManualBookingModalVisible(true);
  };


  const handleSaveManualBooking = async () => {
    if (!manualGuestName.trim() || !manualCheckIn || !manualCheckOut || !targetRoomForBooking) {
      Alert.alert('Campos Incompletos', 'Por favor ingresa el nombre del huésped y las fechas.');
      return;
    }

    setCreatingManualBooking(true);

    const payload: BookingPayload = {
      roomId: targetRoomForBooking.id,
      guestName: manualGuestName.trim(),
      guestEmail: manualGuestEmail.trim() || `${manualGuestName.toLowerCase().replace(/\s+/g, '')}@presencial.aura`,
      checkInDate: manualCheckIn,
      checkOutDate: manualCheckOut,
      guestsCount: parseInt(manualGuestsCount, 10) || 2,
      totalAmount: parseFloat(manualTotalAmount) || targetRoomForBooking.pricePerNight,
      status: manualStatus,
    };

    const res = await roomsApi.createBooking(payload);
    setCreatingManualBooking(false);

    if (res.success) {
      Alert.alert('Reserva Creada', `Reserva #${res.booking?.bookingId} registrada con éxito.`);
      setManualBookingModalVisible(false);
      loadBoardData();
    } else {
      Alert.alert('Error al reservar', res.error || 'No se pudo registrar la reserva.');
    }
  };

  // Manejar cambio de estado de mantenimiento
  const handleToggleMaintenance = async (room: Room) => {
    setActionLoading(true);
    const res = await roomsApi.toggleRoomMaintenance(room.id, !room.isUnderMaintenance);
    setActionLoading(false);
    if (res.success) {
      setSelectedCellInfo(null);
      loadBoardData();
    } else {
      Alert.alert('Error', res.error || 'No se pudo actualizar el mantenimiento.');
    }
  };

  // Determinar el estado de una celda para una habitación y un día específico
  const getCellStatus = (
    room: Room & { bookings?: Booking[] },
    dateStr: string
  ): {
    status: 'AVAILABLE' | 'MAINTENANCE' | 'BOOKED' | 'INACTIVE';
    booking?: Booking;
  } => {
    if (!room.isAvailable) {
      return { status: 'INACTIVE' };
    }
    if (room.isUnderMaintenance) {
      return { status: 'MAINTENANCE' };
    }

    // Buscar si hay reserva confirmada/pendiente en esta fecha
    const booking = room.bookings?.find((b) => {
      return dateStr >= b.checkInDate && dateStr < b.checkOutDate;
    });

    if (booking) {
      return { status: 'BOOKED', booking };
    }

    return { status: 'AVAILABLE' };
  };

  // Determinar color temático según el estado REAL de la reserva en la Base de Datos (BookingStatus)
  const getBookingTheme = (booking: Booking) => {
    switch (booking.status) {
      case 'CONFIRMED':
        return {
          bg: '#0A3B7B', // Azul Booking / Corporativo Elegante
          textColor: '#FFFFFF',
          statusLabel: 'Confirmada',
          brandIcon: 'checkmark-done-circle',
        };
      case 'CHECKED_IN':
        return {
          bg: '#488C8C', // Brand Teal - Huésped en Habitación
          textColor: '#FFFFFF',
          statusLabel: 'En Estadía',
          brandIcon: 'key',
        };
      case 'PENDING':
        return {
          bg: '#F59E0B', // Ámbar / Pendiente de Voucher
          textColor: '#FFFFFF',
          statusLabel: 'Pendiente',
          brandIcon: 'time-outline',
        };
      case 'CHECKED_OUT':
        return {
          bg: '#64748B', // Gris Pizarra
          textColor: '#FFFFFF',
          statusLabel: 'Finalizada',
          brandIcon: 'log-out-outline',
        };
      default:
        return {
          bg: '#0A3B7B',
          textColor: '#FFFFFF',
          statusLabel: 'Reserva',
          brandIcon: 'calendar',
        };
    }
  };

  const CELL_WIDTH = 48;
  const ROW_HEIGHT = 68;

  // Paleta suave de fondo para las habitaciones
  const getRoomRowBg = (index: number) => {
    const bgs = ['bg-[#ECFDF5]/60', 'bg-[#FFFBEB]/60', 'bg-[#F5F3FF]/60', 'bg-[#F0FDF4]/60', 'bg-[#EFF6FF]/60'];
    return bgs[index % bgs.length];
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Top Bar Compacta: Título y Selector de Rango */}
      <View className="bg-white px-4 py-2.5 border-b border-slate-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-[16px] font-black text-slate-900 leading-tight">
              Tablero PMS
            </Text>
          </View>

          {/* Selector de Mes con estilo Pill */}
          <View className="flex-row items-center bg-slate-100 rounded-full px-1.5 py-1 border border-slate-200">
            <TouchableOpacity
              className="w-6 h-6 rounded-full bg-white justify-center items-center shadow-xs"
              onPress={() => setSelectedMonthOffset((prev) => prev - 1)}
            >
              <Ionicons name="chevron-back" size={14} color="#475569" />
            </TouchableOpacity>

            <Text className="px-3 text-[11.5px] font-black text-slate-800 tracking-tight">
              {currentMonthName}
            </Text>

            <TouchableOpacity
              className="w-6 h-6 rounded-full bg-white justify-center items-center shadow-xs"
              onPress={() => setSelectedMonthOffset((prev) => prev + 1)}
            >
              <Ionicons name="chevron-forward" size={14} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Leyenda con los Estados Reales de la BD (Room & BookingStatus) en 2 líneas fluidas */}
        <View className="flex-row flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 pt-2 border-t border-slate-100 px-0.5">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <Text className="text-[10.5px] text-slate-600 font-bold">Disponible</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <Text className="text-[10.5px] text-slate-600 font-bold">Mantenimiento</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#0A3B7B]" />
            <Text className="text-[10.5px] text-slate-600 font-bold">Confirmada</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#488C8C]" />
            <Text className="text-[10.5px] text-slate-600 font-bold">En Estadía</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
            <Text className="text-[10.5px] text-slate-600 font-bold">Inactiva</Text>
          </View>
        </View>
      </View>

      {/* Grid Principal (Matriz X / Y) */}
      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#488C8C" />
          <Text className="text-slate-500 text-[13px] font-medium mt-2">Cargando habitaciones...</Text>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={true} className="flex-1">
            <ScrollView showsVerticalScrollIndicator={true} className="flex-1">
              <View className="bg-white m-2.5 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                
                {/* Header Row: Eje X (Días) */}
                <View className="flex-row bg-[#F8FAFC] border-b border-slate-200 h-14">
                  {/* Celda fija de esquina para Habitaciones (Eje Y) */}
                  <View className="w-28 p-2 justify-center items-center bg-slate-100 border-r border-slate-200">
                    <Text className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      Habitaciones
                    </Text>
                  </View>

                  {/* Columnas de Días con estilo moderno de calendario */}
                  {days.map((d) => {
                    const isWeekend = d.dayOfWeek === 'Sáb' || d.dayOfWeek === 'Dom';
                    return (
                      <View
                        key={d.dateStr}
                        style={{ width: CELL_WIDTH }}
                        className={`justify-center items-center border-r border-slate-200/80 ${
                          d.isToday ? 'bg-teal-50/80' : isWeekend ? 'bg-slate-100/50' : ''
                        }`}
                      >
                        <Text
                          className={`text-[9.5px] uppercase font-bold tracking-tight ${
                            d.isToday
                              ? 'text-[#488C8C] font-black'
                              : isWeekend
                              ? 'text-slate-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {d.dayOfWeek}
                        </Text>
                        
                        <View
                          className={`w-6 h-6 rounded-full justify-center items-center mt-0.5 ${
                            d.isToday
                              ? 'bg-[#488C8C]'
                              : isWeekend
                              ? 'bg-slate-200/70'
                              : ''
                          }`}
                        >
                          <Text
                            className={`text-[12px] font-black ${
                              d.isToday
                                ? 'text-white'
                                : 'text-slate-800'
                            }`}
                          >
                            {d.dayNumber}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Filas de Habitaciones: Eje Y */}
                {rooms.map((room, roomIdx) => {
                  const roomNum = formatRoomNumber(room.roomNumber);
                  const roomPastelBg = getRoomRowBg(roomIdx);

                  // Filtrar reservas que caen dentro del mes visible
                  const visibleBookings = (room.bookings || []).filter((b) => {
                    const startMonthDate = days[0]?.dateStr;
                    const endMonthDate = days[days.length - 1]?.dateStr;
                    return b.checkOutDate > startMonthDate && b.checkInDate <= endMonthDate;
                  });

                  return (
                    <View
                      key={room.id}
                      style={{ height: ROW_HEIGHT }}
                      className={`flex-row border-b border-slate-200 ${roomPastelBg} relative`}
                    >
                      {/* Tarjeta de Habitación (Eje Y) estilo referencia */}
                      <TouchableOpacity
                        className="w-28 p-2.5 bg-white/95 border-r border-slate-200 flex-col justify-center active:bg-slate-100 z-10"
                        onPress={() => {
                          setSelectedCellInfo({
                            room,
                            date: days[0]?.dateStr || '',
                            dayFormatted: 'Panel de Control',
                            status: room.isUnderMaintenance
                              ? 'MAINTENANCE'
                              : !room.isAvailable
                              ? 'INACTIVE'
                              : 'AVAILABLE',
                          });
                        }}
                      >
                        <Text className="text-[13px] font-black text-slate-900 leading-tight" numberOfLines={1}>
                          Hab. {roomNum}
                        </Text>
                        <Text className="text-[10px] font-semibold text-slate-500 mt-0.5" numberOfLines={1}>
                          {room.type}
                        </Text>

                        {/* Íconos de Cama y Capacidad */}
                        <View className="flex-row items-center gap-2 mt-1">
                          <View className="flex-row items-center gap-0.5">
                            <Ionicons name="bed-outline" size={11} color="#64748B" />
                          </View>
                          <View className="flex-row items-center gap-0.5">
                            <Ionicons name="person-outline" size={10} color="#64748B" />
                            <Text className="text-[10px] font-bold text-slate-600">
                              {room.capacity}
                            </Text>
                          </View>
                          {room.isUnderMaintenance && (
                            <View className="w-2 h-2 rounded-full bg-amber-500 ml-auto" />
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Cuadrícula de Fondo (Celdas por día) */}
                      <View className="flex-row flex-1">
                        {days.map((d) => (
                          <TouchableOpacity
                            key={d.dateStr}
                            style={{ width: CELL_WIDTH, height: ROW_HEIGHT }}
                            className="border-r border-slate-200/50 justify-center items-center active:bg-emerald-100/40"
                            onPress={() => {
                              if (room.isUnderMaintenance || !room.isAvailable) {
                                setSelectedCellInfo({
                                  room,
                                  date: d.dateStr,
                                  dayFormatted: `${d.dayOfWeek} ${d.dayNumber} de ${currentMonthName}`,
                                  status: room.isUnderMaintenance
                                    ? 'MAINTENANCE'
                                    : 'INACTIVE',
                                });
                              } else {
                                handleOpenManualBooking(room, d.dateStr);
                              }
                            }}
                          >
                            {room.isUnderMaintenance ? (
                              <View className="w-full h-full bg-amber-500/15 justify-center items-center">
                                <Ionicons name="construct-outline" size={13} color="#D97706" />
                              </View>
                            ) : !room.isAvailable ? (
                              <View className="w-full h-full bg-slate-300/40 justify-center items-center">
                                <Ionicons name="ban-outline" size={13} color="#94A3B8" />
                              </View>
                            ) : (
                              <View className="w-full h-full justify-center items-center">
                                <Ionicons name="add" size={14} color="#CBD5E1" />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* CINTAS / LISTONES DE RESERVAS CONTINUAS (Estilo Booking / Airbnb de la referencia) */}
                      {!room.isUnderMaintenance &&
                        room.isAvailable &&
                        visibleBookings.map((booking, bIdx) => {
                          const monthStart = days[0]?.dateStr;

                          // Calcular día de inicio en el grid
                          const startDayIndex = days.findIndex((d) => d.dateStr === booking.checkInDate);
                          const endDayIndex = days.findIndex((d) => d.dateStr === booking.checkOutDate);

                          // Ajustes de límites si la reserva viene del mes anterior o sigue en el siguiente
                          const startIndex = startDayIndex !== -1 ? startDayIndex : 0;
                          const endIndex =
                            endDayIndex !== -1
                              ? endDayIndex
                              : booking.checkOutDate > days[days.length - 1]?.dateStr
                              ? days.length
                              : startIndex + (booking.nights || 1);

                          const spanDays = Math.max(endIndex - startIndex, 1);
                          const leftPos = 112 + startIndex * CELL_WIDTH; // 112px = ancho columna habitación (w-28)
                          const ribbonWidth = spanDays * CELL_WIDTH - 6;

                          const theme = getBookingTheme(booking);

                          return (
                            <TouchableOpacity
                              key={booking.id}
                              style={{
                                position: 'absolute',
                                left: leftPos + 3,
                                top: 8,
                                width: ribbonWidth,
                                height: ROW_HEIGHT - 16,
                                backgroundColor: theme.bg,
                                borderRadius: 10,
                                zIndex: 20,
                                elevation: 3,
                                shadowColor: '#000',
                                shadowOpacity: 0.15,
                                shadowRadius: 3,
                                shadowOffset: { width: 0, height: 1.5 },
                              }}
                              className="justify-center px-2.5"
                              activeOpacity={0.85}
                              onPress={() => {
                                setSelectedCellInfo({
                                  room,
                                  date: booking.checkInDate,
                                  dayFormatted: `${booking.checkInDate} al ${booking.checkOutDate}`,
                                  status: 'BOOKED',
                                  booking,
                                });
                              }}
                            >
                              <View className="flex-row items-center gap-1.5">
                                <Ionicons
                                  name={theme.brandIcon as any}
                                  size={13}
                                  color={theme.textColor}
                                />
                                <Text
                                  style={{ color: theme.textColor }}
                                  className="text-[11.5px] font-black tracking-tight"
                                  numberOfLines={1}
                                >
                                  {booking.guestName || theme.statusLabel}
                                </Text>
                              </View>
                              <Text
                                style={{ color: theme.textColor, opacity: 0.85 }}
                                className="text-[9.5px] font-bold mt-0.5"
                                numberOfLines={1}
                              >
                                {booking.nights} n. · {theme.statusLabel}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      )}

      {/* Modal de Detalle y Gestión Rápida de la Celda */}
      <Modal
        visible={!!selectedCellInfo}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-slate-900/60 justify-center items-center px-4">
          <View className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl">
            {/* Header Modal */}
            <View className="flex-row justify-between items-center pb-3 border-b border-slate-100">
              <View>
                <Text className="text-[11px] font-bold text-[#488C8C] uppercase tracking-wider">
                  Detalle de Habitación
                </Text>
                <Text className="text-[18px] font-black text-slate-900">
                  Habitación {selectedCellInfo ? formatRoomNumber(selectedCellInfo.room.roomNumber) : ''}
                </Text>
              </View>

              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                onPress={() => setSelectedCellInfo(null)}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Contenido Unificado y Limpio */}
            <View className="py-3.5 space-y-3">
              {/* Información de la Habitación */}
              <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[12px] font-bold text-slate-500">Categoría y Piso:</Text>
                  <Text className="text-[13px] font-black text-slate-900">
                    {selectedCellInfo?.room.type} · Piso {selectedCellInfo?.room.floor}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[12px] font-bold text-slate-500">Capacidad / Precio:</Text>
                  <Text className="text-[13px] font-bold text-slate-800">
                    {selectedCellInfo?.room.capacity} pers. · S/ {selectedCellInfo?.room.pricePerNight}/noche
                  </Text>
                </View>

                <View className="flex-row justify-between items-center pt-2 border-t border-slate-200/60">
                  <Text className="text-[12px] font-bold text-slate-500">Estado Habitación:</Text>
                  <View
                    className={`px-2.5 py-0.5 rounded-full ${
                      selectedCellInfo?.room.isUnderMaintenance
                        ? 'bg-amber-100'
                        : !selectedCellInfo?.room.isAvailable
                        ? 'bg-slate-200'
                        : selectedCellInfo?.booking
                        ? 'bg-sky-100'
                        : 'bg-emerald-100'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black ${
                        selectedCellInfo?.room.isUnderMaintenance
                          ? 'text-amber-800'
                          : !selectedCellInfo?.room.isAvailable
                          ? 'text-slate-700'
                          : selectedCellInfo?.booking
                          ? 'text-sky-800'
                          : 'text-emerald-700'
                      }`}
                    >
                      {selectedCellInfo?.room.isUnderMaintenance
                        ? 'EN MANTENIMIENTO'
                        : !selectedCellInfo?.room.isAvailable
                        ? 'INACTIVA'
                        : selectedCellInfo?.booking
                        ? 'OCUPADA'
                        : 'DISPONIBLE'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Si hay reserva, mostrar ficha elegante del Huésped */}
              {selectedCellInfo?.booking && (
                <View className="bg-teal-50/50 border border-teal-200/80 rounded-2xl p-3.5">
                  <View className="flex-row justify-between items-center pb-2 border-b border-teal-200/60">
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="bookmark" size={14} color="#488C8C" />
                      <Text className="text-[12px] font-black text-teal-900">
                        Reserva #{selectedCellInfo.booking.bookingId}
                      </Text>
                    </View>
                    <View className="bg-white px-2 py-0.5 rounded-md border border-teal-200">
                      <Text className="text-[10px] font-black text-[#488C8C]">
                        {selectedCellInfo.booking.status}
                      </Text>
                    </View>
                  </View>

                  <View className="pt-2 space-y-1.5">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="person" size={13} color="#488C8C" />
                      <Text className="text-[13px] font-black text-slate-900 flex-1" numberOfLines={1}>
                        {selectedCellInfo.booking.guestName}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Ionicons name="calendar-outline" size={13} color="#64748B" />
                      <Text className="text-[11.5px] text-slate-700 font-semibold">
                        {selectedCellInfo.booking.checkInDate} al {selectedCellInfo.booking.checkOutDate} ({selectedCellInfo.booking.nights} noches)
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center pt-2 mt-1 border-t border-teal-200/60">
                      <Text className="text-[11.5px] text-slate-600 font-bold">Total Estadía:</Text>
                      <Text className="text-[15px] font-black text-slate-900">
                        S/ {selectedCellInfo.booking.totalAmount}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Acciones con LuxuryButton */}
            {selectedCellInfo && (
              <View className="pt-3 border-t border-slate-100 flex-row gap-2">
                <View className="flex-1">
                  <LuxuryButton
                    title="Cerrar"
                    variant="outline"
                    onPress={() => setSelectedCellInfo(null)}
                    style={{ width: '100%', marginTop: 0 }}
                  />
                </View>
                <View className="flex-[1.4]">
                  <LuxuryButton
                    title={
                      selectedCellInfo.room.isUnderMaintenance
                        ? 'Quitar Mantenimiento'
                        : 'Mantenimiento'
                    }
                    variant={selectedCellInfo.room.isUnderMaintenance ? 'outline' : 'solid'}
                    iconName="construct-outline"
                    loading={actionLoading}
                    onPress={() => handleToggleMaintenance(selectedCellInfo.room)}
                    style={{
                      width: '100%',
                      marginTop: 0,
                      backgroundColor: selectedCellInfo.room.isUnderMaintenance
                        ? '#FEF3C7'
                        : '#488C8C',
                      borderColor: selectedCellInfo.room.isUnderMaintenance
                        ? '#F59E0B'
                        : '#488C8C',
                    }}
                    textStyle={{
                      color: selectedCellInfo.room.isUnderMaintenance ? '#92400E' : '#FFFFFF',
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL DE RESERVA MANUAL / PRESENCIAL RÁPIDA */}
      <Modal
        visible={manualBookingModalVisible}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[92%] overflow-hidden border-t border-slate-200">
            {/* Header del Modal */}
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
              <View>
                <Text className="text-[11px] text-[#488C8C] font-bold uppercase tracking-wider">
                  Recepción · Reserva Presencial
                </Text>
                <Text className="text-[18px] font-black text-slate-900">
                  Habitación {targetRoomForBooking ? formatRoomNumber(targetRoomForBooking.roomNumber) : ''} ({targetRoomForBooking?.type})
                </Text>
              </View>

              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center active:bg-slate-200"
                onPress={() => setManualBookingModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
              <View className="space-y-2.5 pb-8">
                {/* Nombre del Huésped */}
                <FloatingLabelInput
                  label="Nombre Completo del Huésped *"
                  iconName="person-outline"
                  value={manualGuestName}
                  onChangeText={setManualGuestName}
                />

                {/* Teléfono / Contacto */}
                <FloatingLabelInput
                  label="Teléfono / Celular (Opcional)"
                  iconName="call-outline"
                  keyboardType="phone-pad"
                  value={manualGuestPhone}
                  onChangeText={setManualGuestPhone}
                />

                {/* Correo Electrónico */}
                <FloatingLabelInput
                  label="Email (Opcional)"
                  iconName="mail-outline"
                  keyboardType="email-address"
                  value={manualGuestEmail}
                  onChangeText={setManualGuestEmail}
                />

                {/* Fechas: CheckIn y CheckOut usando CalendarPickerModal */}
                <View className="flex-row gap-2.5 my-1">
                  <TouchableOpacity
                    className="flex-1 bg-[#F1F5F9] border-[1.2px] border-[#CBD5E1] rounded-xl px-3.5 py-2 justify-center active:bg-slate-100"
                    onPress={() => setCalendarTarget('checkIn')}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Ionicons name="calendar-outline" size={13} color="#488C8C" />
                      <Text className="text-[10.5px] font-bold text-slate-500 uppercase tracking-tight">
                        Check-In *
                      </Text>
                    </View>
                    <Text className="text-[14px] font-black text-slate-900">
                      {manualCheckIn || 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-[#F1F5F9] border-[1.2px] border-[#CBD5E1] rounded-xl px-3.5 py-2 justify-center active:bg-slate-100"
                    onPress={() => setCalendarTarget('checkOut')}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Ionicons name="calendar-outline" size={13} color="#488C8C" />
                      <Text className="text-[10.5px] font-bold text-slate-500 uppercase tracking-tight">
                        Check-Out *
                      </Text>
                    </View>
                    <Text className="text-[14px] font-black text-slate-900">
                      {manualCheckOut || 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Número de Huéspedes */}
                <FloatingLabelInput
                  label="N° Huéspedes (Capacidad max: " + (targetRoomForBooking?.capacity || 2) + ")"
                  iconName="people-outline"
                  keyboardType="numeric"
                  value={manualGuestsCount}
                  onChangeText={setManualGuestsCount}
                />

                {/* Resumen del Monto Total Calculado Automáticamente (Solo Lectura) */}
                <View className="bg-[#EBF4F4] border-[1.2px] border-[#CDE5E5] rounded-xl px-4 py-2.5 my-1 flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="pricetag" size={16} color="#488C8C" />
                    <View>
                      <Text className="text-[10.5px] font-bold text-teal-800 uppercase tracking-tight">
                        Monto Total Calculado
                      </Text>
                      <Text className="text-[11px] text-slate-500 font-medium">
                        {manualNights} {parseInt(manualNights, 10) === 1 ? 'noche' : 'noches'} · S/ {targetRoomForBooking?.pricePerNight || 0}/noche
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[18px] font-black text-[#2E6666]">
                    S/ {manualTotalAmount}
                  </Text>
                </View>

                {/* Selector de Estado Inicial (Select) */}
                <View className="mt-1 mb-1">
                  <Text className="text-[11.5px] font-bold text-slate-600 mb-1.5 ml-1">
                    Estado de la Reserva:
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setStatusDropdownOpen(true)}
                    className="bg-[#F8FAFC] border-[1.2px] border-slate-300 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            manualStatus === 'CONFIRMED'
                              ? '#0A3B7B'
                              : manualStatus === 'CHECKED_IN'
                              ? '#488C8C'
                              : '#F59E0B',
                        }}
                      />
                      <Text className="text-[13.5px] font-bold text-slate-800">
                        {manualStatus === 'CONFIRMED'
                          ? 'Confirmada'
                          : manualStatus === 'CHECKED_IN'
                          ? 'En Estadía (Check-In)'
                          : 'Pendiente de Pago'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Botones con LuxuryButton */}
                <View className="flex-row gap-3 pt-3">
                  <View className="flex-1">
                    <LuxuryButton
                      title="Cancelar"
                      variant="outline"
                      onPress={() => setManualBookingModalVisible(false)}
                      disabled={creatingManualBooking}
                      style={{ width: '100%', marginTop: 0 }}
                    />
                  </View>
                  <View className="flex-[1.5]">
                    <LuxuryButton
                      title="Registrar Reserva"
                      variant="solid"
                      iconName="checkmark-circle-outline"
                      loading={creatingManualBooking}
                      onPress={handleSaveManualBooking}
                      style={{ width: '100%', marginTop: 0 }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 1: CALENDARIO DE ENTRADA (CHECK-IN) */}
      <CalendarPickerModal
        visible={calendarTarget === 'checkIn'}
        title="Fecha de Check-In"
        selectedDate={manualCheckIn}
        minDate={new Date().toISOString().split('T')[0]}
        onSelect={(dateStr) => {
          setManualCheckIn(dateStr);
          // Si el checkout es menor o igual, ajustarlo a +1 día
          if (!manualCheckOut || manualCheckOut <= dateStr) {
            const nextDay = new Date(dateStr + 'T00:00:00');
            nextDay.setDate(nextDay.getDate() + 1);
            const nextStr = nextDay.toISOString().split('T')[0];
            setManualCheckOut(nextStr);
            if (targetRoomForBooking) {
              setManualNights('1');
              setManualTotalAmount(String(targetRoomForBooking.pricePerNight));
            }
          } else {
            const d1 = new Date(dateStr + 'T00:00:00').getTime();
            const d2 = new Date(manualCheckOut + 'T00:00:00').getTime();
            const n = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
            setManualNights(String(n));
            if (targetRoomForBooking) {
              setManualTotalAmount(String(n * targetRoomForBooking.pricePerNight));
            }
          }
        }}
        onClose={() => setCalendarTarget(null)}
      />

      {/* MODAL 2: CALENDARIO DE SALIDA (CHECK-OUT) */}
      <CalendarPickerModal
        visible={calendarTarget === 'checkOut'}
        title="Fecha de Check-Out"
        selectedDate={manualCheckOut}
        minDate={manualCheckIn || new Date().toISOString().split('T')[0]}
        onSelect={(dateStr) => {
          setManualCheckOut(dateStr);
          if (manualCheckIn) {
            const d1 = new Date(manualCheckIn + 'T00:00:00').getTime();
            const d2 = new Date(dateStr + 'T00:00:00').getTime();
            const n = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
            setManualNights(String(n));
            if (targetRoomForBooking) {
              setManualTotalAmount(String(n * targetRoomForBooking.pricePerNight));
            }
          }
        }}
        onClose={() => setCalendarTarget(null)}
      />

      {/* MODAL 3: SELECTOR DE ESTADO DE RESERVA */}
      <Modal
        visible={statusDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusDropdownOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end sm:justify-center items-center px-4"
          activeOpacity={1}
          onPress={() => setStatusDropdownOpen(false)}
        >
          <View
            className="w-full max-w-[380px] bg-white rounded-3xl p-5 mb-6 sm:mb-0 shadow-2xl border border-slate-100"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="options-outline" size={20} color="#488C8C" />
                <Text className="text-[16px] font-black text-slate-900">
                  Estado de la Reserva
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setStatusDropdownOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="gap-2.5">
              {[
                {
                  value: 'CONFIRMED' as const,
                  label: 'Confirmada',
                  desc: 'Reserva garantizada y confirmada',
                  color: '#0A3B7B',
                  bg: '#EFF6FF',
                  border: '#BFDBFE',
                  icon: 'shield-checkmark',
                },
                {
                  value: 'CHECKED_IN' as const,
                  label: 'En Estadía (Check-In)',
                  desc: 'Huésped registrado e instalado',
                  color: '#488C8C',
                  bg: '#EBF4F4',
                  border: '#CDE5E5',
                  icon: 'key',
                },
                {
                  value: 'PENDING' as const,
                  label: 'Pendiente de Pago',
                  desc: 'Apartada a espera de liquidación',
                  color: '#D97706',
                  bg: '#FFFBEB',
                  border: '#FDE68A',
                  icon: 'time',
                },
              ].map((opt) => {
                const isSelected = manualStatus === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setManualStatus(opt.value);
                      setStatusDropdownOpen(false);
                    }}
                    style={{
                      backgroundColor: isSelected ? opt.bg : '#F8FAFC',
                      borderColor: isSelected ? opt.color : '#E2E8F0',
                      borderWidth: isSelected ? 2 : 1,
                    }}
                    className="p-3.5 rounded-2xl flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: opt.bg }}
                      >
                        <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-[14px] font-bold"
                          style={{ color: isSelected ? opt.color : '#1E293B' }}
                        >
                          {opt.label}
                        </Text>
                        <Text className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                          {opt.desc}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={opt.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
