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
import { Room, roomsApi, formatRoomNumber, Booking } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';

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
                            className="border-r border-slate-200/50 justify-center items-center"
                            onPress={() => {
                              setSelectedCellInfo({
                                room,
                                date: d.dateStr,
                                dayFormatted: `${d.dayOfWeek} ${d.dayNumber} de ${currentMonthName}`,
                                status: room.isUnderMaintenance
                                  ? 'MAINTENANCE'
                                  : !room.isAvailable
                                  ? 'INACTIVE'
                                  : 'AVAILABLE',
                              });
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
                            ) : null}
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

            {/* Contenido */}
            <View className="py-4 space-y-2.5">
              <View className="flex-row justify-between items-center">
                <Text className="text-[12px] text-slate-500 font-semibold">Fecha:</Text>
                <Text className="text-[12px] font-bold text-slate-800">
                  {selectedCellInfo?.dayFormatted}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-[12px] text-slate-500 font-semibold">Tipo:</Text>
                <Text className="text-[12px] font-bold text-slate-800">
                  {selectedCellInfo?.room.type} (Piso {selectedCellInfo?.room.floor})
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-[12px] text-slate-500 font-semibold">Estado:</Text>
                <View
                  className={`px-2.5 py-0.5 rounded-full ${
                    selectedCellInfo?.status === 'AVAILABLE'
                      ? 'bg-emerald-100'
                      : selectedCellInfo?.status === 'MAINTENANCE'
                      ? 'bg-amber-100'
                      : selectedCellInfo?.status === 'BOOKED'
                      ? 'bg-sky-100'
                      : 'bg-slate-200'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-black ${
                      selectedCellInfo?.status === 'AVAILABLE'
                        ? 'text-emerald-700'
                        : selectedCellInfo?.status === 'MAINTENANCE'
                        ? 'text-amber-800'
                        : selectedCellInfo?.status === 'BOOKED'
                        ? 'text-sky-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {selectedCellInfo?.status === 'AVAILABLE'
                      ? 'DISPONIBLE'
                      : selectedCellInfo?.status === 'MAINTENANCE'
                      ? 'EN MANTENIMIENTO'
                      : selectedCellInfo?.status === 'BOOKED'
                      ? 'OCUPADA'
                      : 'INACTIVA'}
                  </Text>
                </View>
              </View>

              {/* Si hay reserva, mostrar info del huésped */}
              {selectedCellInfo?.booking && (
                <View className="bg-sky-50 border border-sky-200 rounded-xl p-3 mt-2">
                  <Text className="text-[11px] font-bold text-sky-800 uppercase">
                    Reserva #{selectedCellInfo.booking.bookingId}
                  </Text>
                  <Text className="text-[13px] font-black text-slate-900 mt-1">
                    {selectedCellInfo.booking.guestName}
                  </Text>
                  <Text className="text-[11px] text-slate-600 font-medium">
                    {selectedCellInfo.booking.checkInDate} al {selectedCellInfo.booking.checkOutDate}
                  </Text>
                </View>
              )}
            </View>

            {/* Botón de Alternar Mantenimiento */}
            {selectedCellInfo && (
              <View className="pt-2 border-t border-slate-100">
                <LuxuryButton
                  title={
                    selectedCellInfo.room.isUnderMaintenance
                      ? 'Quitar de Mantenimiento'
                      : 'Poner en Mantenimiento'
                  }
                  variant={selectedCellInfo.room.isUnderMaintenance ? 'outline' : 'solid'}
                  iconName="construct-outline"
                  loading={actionLoading}
                  onPress={() => handleToggleMaintenance(selectedCellInfo.room)}
                  style={{
                    width: '100%',
                    backgroundColor: selectedCellInfo.room.isUnderMaintenance
                      ? '#FEF3C7'
                      : '#D97706',
                    borderColor: '#F59E0B',
                  }}
                  textStyle={{
                    color: selectedCellInfo.room.isUnderMaintenance ? '#92400E' : '#FFFFFF',
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
