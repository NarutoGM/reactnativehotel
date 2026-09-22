import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, Booking, formatRoomNumber, roomsApi } from '../api/rooms.api';
import { LuxuryButton } from '@/components/LuxuryButton';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { BookingStatusPickerModal, BookingStatusType } from './BookingStatusPickerModal';

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
  onBookingUpdated?: () => void;
  onClose: () => void;
}

export const BoardCellDetailModal: React.FC<BoardCellDetailModalProps> = ({
  visible,
  cellInfo,
  actionLoading,
  onToggleMaintenance,
  onBookingUpdated,
  onClose,
}) => {
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestEmail, setEditGuestEmail] = useState('');
  const [editGuestsCount, setEditGuestsCount] = useState('2');
  const [editStatus, setEditStatus] = useState<BookingStatusType>('CONFIRMED');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);

  useEffect(() => {
    if (cellInfo?.booking) {
      setEditGuestName(cellInfo.booking.guestName || '');
      setEditGuestEmail(cellInfo.booking.guestEmail || '');
      setEditGuestsCount(String(cellInfo.booking.guestsCount || 2));
      setEditStatus((cellInfo.booking.status as BookingStatusType) || 'CONFIRMED');
      setIsEditingBooking(false);
    }
  }, [cellInfo, visible]);

  if (!cellInfo) return null;

  const handleSaveBookingEdit = async () => {
    if (!cellInfo.booking) return;

    if (!editGuestName.trim()) {
      Alert.alert('Nombre Requerido', 'Por favor ingresa el nombre del huésped.');
      return;
    }

    const count = parseInt(editGuestsCount, 10) || 1;
    if (count < 1) {
      Alert.alert('Cantidad Inválida', 'Debe haber al menos 1 huésped.');
      return;
    }

    if (cellInfo.room.capacity && count > cellInfo.room.capacity) {
      Alert.alert('Capacidad Excedida', `La capacidad máxima es de ${cellInfo.room.capacity} personas.`);
      return;
    }

    setSavingBooking(true);
    const res = await roomsApi.updateBookingDetails(cellInfo.booking.id, {
      guestName: editGuestName.trim(),
      guestEmail: editGuestEmail.trim(),
      guestsCount: count,
      status: editStatus,
    });
    setSavingBooking(false);

    if (res.success) {
      Alert.alert('Reserva Actualizada', 'Los datos del huésped y la reserva se guardaron con éxito.');
      setIsEditingBooking(false);
      if (onBookingUpdated) {
        onBookingUpdated();
      }
      onClose();
    } else {
      Alert.alert('Error', res.error || 'No se pudieron actualizar los datos.');
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'CONFIRMED': return '#0A3B7B';
      case 'CHECKED_IN': return '#488C8C';
      case 'PENDING': return '#F59E0B';
      case 'CANCELLED': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'CONFIRMED': return 'Confirmada';
      case 'CHECKED_IN': return 'En Estadía';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return st;
    }
  };

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

          {/* Contenido Unificado (Sin bordes ni fondos separados) */}
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[380px] my-2">
            <View className="py-2 space-y-2.5">
              {/* Bloque 1: Datos de la Habitación */}
              <View className="flex-row justify-between items-center py-1">
                <Text className="text-[12.5px] font-bold text-slate-500">Categoría y Piso:</Text>
                <Text className="text-[13px] font-black text-slate-900">
                  {cellInfo.room.type} · Piso {cellInfo.room.floor}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-[12.5px] font-bold text-slate-500">Capacidad / Precio:</Text>
                <Text className="text-[13px] font-bold text-slate-800">
                  {cellInfo.room.capacity} pers. · S/ {cellInfo.room.pricePerNight}/noche
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-1">
                <Text className="text-[12.5px] font-bold text-slate-500">Estado Habitación:</Text>
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

              {/* Divisor sutil y elegante */}
              {cellInfo.booking && (
                <View className="border-t border-slate-200/70 pt-2.5 mt-1">
                  {/* Header de Reserva y Botón de Editar */}
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="bookmark" size={15} color="#488C8C" />
                      <Text className="text-[13px] font-black text-slate-900">
                        Reserva #{cellInfo.booking.bookingId}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsEditingBooking((prev) => !prev)}
                      className="flex-row items-center gap-1 bg-[#EBF4F4] px-2.5 py-1 rounded-lg"
                    >
                      <Ionicons
                        name={isEditingBooking ? 'eye-outline' : 'pencil'}
                        size={12}
                        color="#488C8C"
                      />
                      <Text className="text-[11px] font-bold text-[#488C8C]">
                        {isEditingBooking ? 'Ver datos' : 'Editar Huésped'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Modo Visualización */}
                  {!isEditingBooking ? (
                    <View className="space-y-2">
                      <View className="flex-row items-center justify-between py-0.5">
                        <View className="flex-row items-center gap-2 flex-1">
                          <Ionicons name="person" size={14} color="#488C8C" />
                          <Text className="text-[13.5px] font-black text-slate-900 flex-1" numberOfLines={1}>
                            {cellInfo.booking.guestName}
                          </Text>
                        </View>
                        <View
                          className="px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${getStatusColor(cellInfo.booking.status)}15` }}
                        >
                          <Text
                            className="text-[10.5px] font-black"
                            style={{ color: getStatusColor(cellInfo.booking.status) }}
                          >
                            {getStatusLabel(cellInfo.booking.status)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2 py-0.5">
                        <Ionicons name="mail-outline" size={13.5} color="#64748B" />
                        <Text className="text-[12px] text-slate-600 font-medium">
                          {cellInfo.booking.guestEmail || 'Sin correo registrado'}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2 py-0.5">
                        <Ionicons name="calendar-outline" size={13.5} color="#64748B" />
                        <Text className="text-[12px] text-slate-700 font-semibold">
                          {cellInfo.booking.checkInDate} al {cellInfo.booking.checkOutDate} ({cellInfo.booking.nights} noches)
                        </Text>
                      </View>

                      <View className="flex-row justify-between items-center pt-2 border-t border-slate-100">
                        <Text className="text-[12px] text-slate-600 font-bold">Total Estadía:</Text>
                        <Text className="text-[16px] font-black text-[#2E6666]">
                          S/ {cellInfo.booking.totalAmount}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    /* Modo Edición del Huésped */
                    <View className="space-y-1 pt-1">
                      <FloatingLabelInput
                        label="Nombre del Huésped *"
                        iconName="person-outline"
                        value={editGuestName}
                        onChangeText={setEditGuestName}
                      />

                      <FloatingLabelInput
                        label="Email del Huésped"
                        iconName="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={editGuestEmail}
                        onChangeText={setEditGuestEmail}
                      />

                      <FloatingLabelInput
                        label={`N° Huéspedes (Max: ${cellInfo.room.capacity || 2})`}
                        iconName="people-outline"
                        keyboardType="numeric"
                        value={editGuestsCount}
                        onChangeText={(val) => {
                          const cleanVal = val.replace(/[^0-9]/g, '');
                          if (!cleanVal) {
                            setEditGuestsCount('');
                            return;
                          }
                          const num = parseInt(cleanVal, 10);
                          const maxCap = cellInfo.room.capacity || 2;
                          setEditGuestsCount(String(num > maxCap ? maxCap : num));
                        }}
                      />

                      {/* Selector de Estado */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setStatusPickerOpen(true)}
                        className="bg-[#F8FAFC] border-[1.2px] border-slate-300 rounded-xl px-3.5 py-2.5 flex-row justify-between items-center my-1"
                      >
                        <View className="flex-row items-center gap-2">
                          <View
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getStatusColor(editStatus) }}
                          />
                          <Text className="text-[12.5px] font-bold text-slate-800">
                            {getStatusLabel(editStatus)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-down" size={16} color="#64748B" />
                      </TouchableOpacity>

                      <View className="pt-2">
                        <LuxuryButton
                          title="Guardar Cambios"
                          variant="solid"
                          iconName="checkmark"
                          loading={savingBooking}
                          onPress={handleSaveBookingEdit}
                          style={{ width: '100%', marginTop: 0 }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Acciones con LuxuryButton */}
          {!isEditingBooking && (
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
          )}
        </View>
      </View>

      {/* Modal Picker para cambiar estado durante la edición */}
      <BookingStatusPickerModal
        visible={statusPickerOpen}
        selectedStatus={editStatus}
        onSelect={setEditStatus}
        onClose={() => setStatusPickerOpen(false)}
      />
    </Modal>
  );
};
