import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, Booking, formatRoomNumber } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';

export interface BoardCellInfo {
  room: Room;
  date: string;
  dayFormatted: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'BOOKED' | 'INACTIVE';
  booking?: Booking;
}

interface BoardCellDetailModalProps {
  visible: boolean;
  cellInfo: BoardCellInfo | null;
  actionLoading: boolean;
  onToggleMaintenance: (room: Room) => void;
  onClose: () => void;
}

export const BoardCellDetailModal: React.FC<BoardCellDetailModalProps> = ({
  visible,
  cellInfo,
  actionLoading,
  onToggleMaintenance,
  onClose,
}) => {
  if (!cellInfo) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-900/60 justify-center items-center px-4">
        <View className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-200 shadow-2xl">
          {/* Header Modal */}
          <View className="flex-row justify-between items-center pb-3 border-b border-slate-100">
            <View>
              <Text className="text-[11px] font-bold text-[#488C8C] uppercase tracking-wider">
                Detalle de Habitación
              </Text>
              <Text className="text-[18px] font-black text-slate-900">
                Habitación {formatRoomNumber(cellInfo.room.roomNumber)}
              </Text>
            </View>

            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <View className="py-3.5 space-y-3">
            {/* Información de la Habitación */}
            <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[12px] font-bold text-slate-500">Categoría y Piso:</Text>
                <Text className="text-[13px] font-black text-slate-900">
                  {cellInfo.room.type} · Piso {cellInfo.room.floor}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[12px] font-bold text-slate-500">Capacidad / Precio:</Text>
                <Text className="text-[13px] font-bold text-slate-800">
                  {cellInfo.room.capacity} pers. · S/ {cellInfo.room.pricePerNight}/noche
                </Text>
              </View>

              <View className="flex-row justify-between items-center pt-2 border-t border-slate-200/60">
                <Text className="text-[12px] font-bold text-slate-500">Estado Habitación:</Text>
                <View
                  className={`px-2.5 py-0.5 rounded-full ${
                    cellInfo.room.isUnderMaintenance
                      ? 'bg-amber-100'
                      : !cellInfo.room.isAvailable
                      ? 'bg-slate-200'
                      : cellInfo.booking
                      ? 'bg-sky-100'
                      : 'bg-emerald-100'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      cellInfo.room.isUnderMaintenance
                        ? 'text-amber-800'
                        : !cellInfo.room.isAvailable
                        ? 'text-slate-700'
                        : cellInfo.booking
                        ? 'text-sky-800'
                        : 'text-emerald-700'
                    }`}
                  >
                    {cellInfo.room.isUnderMaintenance
                      ? 'EN MANTENIMIENTO'
                      : !cellInfo.room.isAvailable
                      ? 'INACTIVA'
                      : cellInfo.booking
                      ? 'OCUPADA'
                      : 'DISPONIBLE'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Si hay reserva, mostrar ficha elegante del Huésped */}
            {cellInfo.booking && (
              <View className="bg-teal-50/50 border border-teal-200/80 rounded-2xl p-3.5">
                <View className="flex-row justify-between items-center pb-2 border-b border-teal-200/60">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="bookmark" size={14} color="#488C8C" />
                    <Text className="text-[12px] font-black text-teal-900">
                      Reserva #{cellInfo.booking.bookingId}
                    </Text>
                  </View>
                  <View className="bg-white px-2 py-0.5 rounded-md border border-teal-200">
                    <Text className="text-[10px] font-black text-[#488C8C]">
                      {cellInfo.booking.status}
                    </Text>
                  </View>
                </View>

                <View className="pt-2 space-y-1.5">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="person" size={13} color="#488C8C" />
                    <Text className="text-[13px] font-black text-slate-900 flex-1" numberOfLines={1}>
                      {cellInfo.booking.guestName}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={13} color="#64748B" />
                    <Text className="text-[11.5px] text-slate-700 font-semibold">
                      {cellInfo.booking.checkInDate} al {cellInfo.booking.checkOutDate} ({cellInfo.booking.nights} noches)
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center pt-2 mt-1 border-t border-teal-200/60">
                    <Text className="text-[11.5px] text-slate-600 font-bold">Total Estadía:</Text>
                    <Text className="text-[15px] font-black text-slate-900">
                      S/ {cellInfo.booking.totalAmount}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Acciones con LuxuryButton */}
          <View className="pt-3 border-t border-slate-100 flex-row gap-2">
            <View className="flex-1">
              <LuxuryButton
                title="Cerrar"
                variant="outline"
                onPress={onClose}
                style={{ width: '100%', marginTop: 0 }}
              />
            </View>
            <View className="flex-[1.4]">
              <LuxuryButton
                title={
                  cellInfo.room.isUnderMaintenance
                    ? 'Quitar Mantenimiento'
                    : 'Mantenimiento'
                }
                variant={cellInfo.room.isUnderMaintenance ? 'outline' : 'solid'}
                iconName="construct-outline"
                loading={actionLoading}
                onPress={() => onToggleMaintenance(cellInfo.room)}
                style={{
                  width: '100%',
                  marginTop: 0,
                  backgroundColor: cellInfo.room.isUnderMaintenance ? '#FEF3C7' : '#488C8C',
                  borderColor: cellInfo.room.isUnderMaintenance ? '#F59E0B' : '#488C8C',
                }}
                textStyle={{
                  color: cellInfo.room.isUnderMaintenance ? '#92400E' : '#FFFFFF',
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
