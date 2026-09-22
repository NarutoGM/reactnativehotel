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

  return (
    <View className="flex-1 bg-slate-100">
      {/* Top Bar: Selector de Mes y Leyenda */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-[17px] font-black text-slate-900">
              Tablero de Ocupación
            </Text>
            <Text className="text-[12px] text-slate-500 font-medium">
              Matriz de Habitaciones y Calendario
            </Text>
          </View>

          {/* Selector de Mes */}
          <View className="flex-row items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <TouchableOpacity
              className="p-1.5 rounded-lg active:bg-white"
              onPress={() => setSelectedMonthOffset((prev) => prev - 1)}
            >
              <Ionicons name="chevron-back" size={18} color="#475569" />
            </TouchableOpacity>

            <Text className="px-2.5 text-[12px] font-extrabold text-slate-800">
              {currentMonthName}
            </Text>

            <TouchableOpacity
              className="p-1.5 rounded-lg active:bg-white"
              onPress={() => setSelectedMonthOffset((prev) => prev + 1)}
            >
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Leyenda de Estados */}
        <View className="flex-row flex-wrap gap-2.5 mt-3 pt-2.5 border-t border-slate-100">
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-emerald-500" />
            <Text className="text-[11px] text-slate-600 font-semibold">Disponible</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-amber-500" />
            <Text className="text-[11px] text-slate-600 font-semibold">Mantenimiento</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-sky-500" />
            <Text className="text-[11px] text-slate-600 font-semibold">Ocupada / Reserva</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-slate-400" />
            <Text className="text-[11px] text-slate-600 font-semibold">Inactiva</Text>
          </View>
        </View>
      </View>

      {/* Grid Principal (Matriz X / Y) */}
      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#488C8C" />
          <Text className="text-slate-500 text-[13px] font-medium mt-2">Cargando tablero...</Text>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={true} className="flex-1">
            <ScrollView showsVerticalScrollIndicator={true} className="flex-1">
              <View className="bg-white m-3 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Header Row: Eje X (Días) */}
                <View className="flex-row bg-slate-50 border-b border-slate-200">
                  {/* Celda fija de esquina para Habitaciones (Eje Y) */}
                  <View className="w-28 p-2.5 justify-center items-center bg-slate-100 border-r border-slate-200">
                    <Text className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      Habitación
                    </Text>
                  </View>

                  {/* Columnas de Días */}
                  {days.map((d) => (
                    <View
                      key={d.dateStr}
                      className={`w-11 py-2 justify-center items-center border-r border-slate-200 ${
                        d.isToday ? 'bg-teal-50/80 border-b-2 border-b-[#488C8C]' : ''
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          d.isToday ? 'text-[#488C8C] font-black' : 'text-slate-500'
                        }`}
                      >
                        {d.dayOfWeek}
                      </Text>
                      <Text
                        className={`text-[13px] font-black mt-0.5 ${
                          d.isToday ? 'text-[#488C8C]' : 'text-slate-800'
                        }`}
                      >
                        {d.dayNumber}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Filas de Habitaciones: Eje Y */}
                {rooms.map((room) => {
                  const roomNum = formatRoomNumber(room.roomNumber);
                  return (
                    <View
                      key={room.id}
                      className="flex-row border-b border-slate-200 items-center"
                    >
                      {/* Cabecera de fila de Habitación */}
                      <TouchableOpacity
                        className="w-28 p-2.5 bg-slate-50 border-r border-slate-200 flex-row items-center justify-between active:bg-slate-100"
                        onPress={() => {
                          setSelectedCellInfo({
                            room,
                            date: days[0]?.dateStr || '',
                            dayFormatted: 'Información General',
                            status: room.isUnderMaintenance
                              ? 'MAINTENANCE'
                              : !room.isAvailable
                              ? 'INACTIVE'
                              : 'AVAILABLE',
                          });
                        }}
                      >
                        <View>
                          <Text className="text-[13px] font-black text-slate-900">
                            Hab. {roomNum}
                          </Text>
                          <Text className="text-[10px] text-slate-500 font-medium" numberOfLines={1}>
                            {room.type} · P{room.floor}
                          </Text>
                        </View>

                        {room.isUnderMaintenance && (
                          <View className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </TouchableOpacity>

                      {/* Cuadrículas de días para esta habitación */}
                      {days.map((d) => {
                        const cellData = getCellStatus(room, d.dateStr);

                        let bgColor = 'bg-emerald-500';
                        let iconName = 'checkmark';
                        let cellOpacity = 'opacity-90';

                        if (cellData.status === 'MAINTENANCE') {
                          bgColor = 'bg-amber-500';
                          iconName = 'construct-outline';
                          cellOpacity = 'opacity-100';
                        } else if (cellData.status === 'BOOKED') {
                          bgColor = 'bg-sky-500';
                          iconName = 'person';
                          cellOpacity = 'opacity-100';
                        } else if (cellData.status === 'INACTIVE') {
                          bgColor = 'bg-slate-300';
                          iconName = 'ban-outline';
                          cellOpacity = 'opacity-60';
                        }

                        return (
                          <TouchableOpacity
                            key={d.dateStr}
                            className={`w-11 h-11 justify-center items-center border-r border-slate-200 p-1 active:opacity-75 ${
                              d.isToday ? 'bg-slate-50/50' : ''
                            }`}
                            onPress={() => {
                              setSelectedCellInfo({
                                room,
                                date: d.dateStr,
                                dayFormatted: `${d.dayOfWeek} ${d.dayNumber} de ${currentMonthName}`,
                                status: cellData.status,
                                booking: cellData.booking,
                              });
                            }}
                          >
                            <View
                              className={`w-full h-full rounded-lg ${bgColor} ${cellOpacity} justify-center items-center shadow-xs`}
                            >
                              <Ionicons
                                name={iconName as any}
                                size={14}
                                color="#FFFFFF"
                              />
                            </View>
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
